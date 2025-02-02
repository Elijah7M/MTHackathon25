import os
import json
import sqlite3
from flask import Flask, render_template, request, jsonify, session
from werkzeug.utils import secure_filename
import database  # now using the new database.py

# ✅ Get the absolute path to the database in the Hackathon folder
DB_PATH = database.DB_PATH

# ADDED: Clear SQLite lock files to avoid "database is locked" errors.
def clear_sqlite_locks():
    DB_PATH = database.DB_PATH
    for ext in ["-wal", "-shm"]:
        lock_file = f"{DB_PATH}{ext}"
        if os.path.exists(lock_file):
            os.remove(lock_file)

clear_sqlite_locks()  # ADDED

app = Flask(__name__, template_folder='templates')
app.secret_key = 'YOUR_SECRET_KEY'

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    # Render the index.html that includes the input form, loading overlay, and hidden results page.
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    # Validate username
    username = request.form.get('username', '').strip()
    if not username:
        return jsonify({'error': 'No username provided'}), 400

    # Validate resume file
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
    resume_file = request.files['resume']
    if resume_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save resume file
    filename = secure_filename(resume_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    resume_file.save(filepath)

    # Only allow .docx files
    if not filename.lower().endswith('.docx'):
        return jsonify({'error': 'Unsupported file type. Upload a .docx file.'}), 400

    # Read resume text using database.py function
    resume_text = database.read_resume(filepath)
    if not resume_text:
        return jsonify({'error': 'Could not read resume text from file.'}), 500
    
    
    # ✅ Delete resume file after processing
    try:
        os.remove(filepath)
    except Exception as e:
        print(f"⚠️ Warning: Could not delete file {filepath}. Error: {e}")

    # Insert user into database
    user_id = database.insert_user(username=username, resume_text=resume_text)

    # Parse skills and job preferences
    try:
        hard_skills = json.loads(request.form.get('hardSkills', '[]'))
        soft_skills = json.loads(request.form.get('softSkills', '[]'))
        job_prefs = json.loads(request.form.get('jobPreferences', '[]'))
    except json.JSONDecodeError:
        hard_skills, soft_skills, job_prefs = [], [], []

    # Combine hard and soft skills and insert them
    all_skills = hard_skills + soft_skills
    if all_skills:
        database.insert_skills(all_skills)
        database.assign_user_skills(user_id, all_skills)

    # Insert job preferences as keywords and link to user
    if job_prefs:
        keyword_ids = [database.insert_keyword(keyword) for keyword in job_prefs if keyword]  # Get all IDs
        database.insert_user_keywords(user_id, keyword_ids)  # ✅ Pass list of keyword IDs

    # For each job preference, fetch jobs from the APIs and insert them
    all_jobs = set()
    for keyword in job_prefs:
        jobs = database.get_combined_jobs([keyword], "United States", results_per_page=25)
        for job in jobs:
            if job["id"] not in all_jobs:
                all_jobs.add(job["id"])
                database.insert_job_data([job])
                database.insert_job_skills(job["id"], all_skills)

    # Get recommended jobs using the AI model
    recommended = database.recommend_jobs(user_id, top_n=5)

    # For each recommended job, look up additional details from the JOB table and include the job ID
    results = []
    conn = sqlite3.connect(database.DB_PATH)
    cursor = conn.cursor()
    for (job_id, job_title, similarity) in recommended:
        cursor.execute("SELECT JOB_COMPANY, JOB_SALARY, JOB_URL FROM JOB WHERE JOB_ID = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            company, salary, link = row
        else:
            company, salary, link = ("Unknown Company", "N/A", "#")
        results.append({
            "jobId": job_id,  # added for rating purposes
            "title": job_title,
            "company": company,
            "salary": str(salary) if salary else "N/A",
            "similarity": f"{similarity:.4f}",
            "link": link
        })
    conn.close()

    # ✅ Build career goal recommendation based on BLS data
    career_goal = database.recommend_career_goal(user_id)  # Fetch from AI career mapping

    user_summary = {
        'achievements': "Led a team of 4 on a major project.",
        'skills': ", ".join(all_skills) if all_skills else "N/A",
        'education': career_goal.get("education_needed", "N/A"),  # ✅ Fix: Use "education_needed"
        'improvements': f"Consider obtaining {', '.join(career_goal.get('recommended_certifications', []))}.",
        'careerGoal': {
            'title': career_goal.get("title", "N/A"),  # ✅ Fix: Use correct key
            'reason': career_goal.get("duties", "N/A"),  # ✅ Fix: Use "duties" instead of "reason"
            'education': career_goal.get("education_needed", "N/A"),
            'certifications': career_goal.get("recommended_certifications", []),  # ✅ Fix: Renamed
            'experience': career_goal.get("experience_needed", "N/A"),  # ✅ Fix: Use "experience_needed"
            'salary': career_goal.get("average_salary", "N/A"),  # ✅ Fix: Include salary
            'job_outlook': career_goal.get("job_outlook", "N/A"),  # ✅ Fix: Add job outlook
            'roadmap': career_goal.get("roadmap", "N/A")  # ✅ Fix: Include roadmap
        }
    }

    # Store userId in session for later use (e.g., regenerate recommendations and rating)
    session['userId'] = user_id

    # Return JSON response with recommended jobs and user summary
    return jsonify({
        'error': None,
        'message': 'Analysis complete! Data saved.',
        'userId': user_id,
        'recommendedJobs': results,
        'userSummary': user_summary
    })

@app.route('/regenerate', methods=['POST'])
def regenerate():
    # Endpoint to clear old recommendations and return new ones.
    data = request.get_json() or {}
    user_id = data.get('userId')
    if not user_id:
        return jsonify({'error': 'No userId provided'}), 400

    new_recs = database.regenerate_recommendations(user_id, top_n=5)
    
    results = []
    conn = sqlite3.connect(database.DB_PATH)
    cursor = conn.cursor()
    for (job_id, job_title, similarity) in new_recs:
        cursor.execute("SELECT JOB_COMPANY, JOB_SALARY, JOB_URL FROM JOB WHERE JOB_ID = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            company, salary, link = row
        else:
            company, salary, link = ("Unknown Company", "N/A", "#")
        results.append({
            "jobId": job_id,  
            "title": job_title,
            "company": company,
            "salary": database.format_salary(salary),  # ✅ Format salary before sending
            "similarity": f"{similarity:.4f}",
            "link": link
        })
    conn.close()

    return jsonify({
        'error': None,
        'message': 'Regenerated job recommendations!',
        'recommendedJobs': results
    })

# New endpoint for rating a job recommendation.
@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json() or {}
    user_id = data.get('userId')
    job_id = data.get('jobId')
    rating = data.get('rating')
    if not user_id or not job_id or not rating:
        return jsonify({'error': 'Missing required fields.'}), 400
    try:
        rating = int(rating)
    except ValueError:
        return jsonify({'error': 'Invalid rating.'}), 400
    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5.'}), 400

    # Use the database function to update the rating.
    database.rate_recommendation(user_id, job_id, rating)
    return jsonify({'message': 'Rating submitted successfully!'})

if __name__ == '__main__':
    database.create_tables()  # Initialize tables
    app.run(debug=True)
