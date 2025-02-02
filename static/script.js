/* Basic reset & page layout (unchanged) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #333;
}

header {
  background-color: #1976d2; 
  padding: 1rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

nav .logo {
  font-size: 1.25rem;
  font-weight: bold;
}

nav .nav-links a {
  color: #fff;
  margin-left: 1rem;
  text-decoration: none;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 2rem;
}

.file-upload {
  border: 2px dashed #ccc;
  padding: 1rem;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.file-upload:hover {
  border-color: #1976d2;
}

.file-info {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
}

/* Skills Section */
.skills-section label {
  display: block;
  margin: 0.5rem 0 0.25rem;
  font-weight: 600;
}

.skills-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Button */
.btn {
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #135a9a;
}

.button-container {
  text-align: center;
  margin-top: 2rem;
}

/* Footer */
footer {
  background-color: #f1f1f1;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  border-top: 1px solid #ddd;
}

/* Skill/Chip styling */
.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  background-color: #1976d2;
  color: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.remove-skill-btn {
  margin-left: 0.4rem;
  cursor: pointer;
  font-weight: bold;
}

/* Loading Overlay */
#loadingOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 80px;
  height: 80px;
  border: 10px solid #f3f3f3;
  border-top: 10px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Container for all recommended jobs */
#recommendedJobsContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Container for all recommended jobs */
#recommendedJobsContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* This box holds all job entries */
.recommended-job-box {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f9f9f9;
  max-width: 600px;  /* Adjust width as desired */
  margin: 1rem auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Styling for individual job entries */
.job-entry {
  margin-bottom: 1rem;
}

.job-entry:last-child {
  margin-bottom: 0;
}

/* Constrain the user summary and learning resources containers */
#userSummaryContainer,
#learningResourcesContainer {
  max-width: 600px;
  margin: 1rem auto;
}

/* New wrapper for the stars and check mark to display them in a row */
.stars-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Rating container: center content in a column */
.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.2rem;
}

/* Label above the stars */
.rating-label {
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  color: #555;
}

/* Stars container: keep stars in a row */
.stars {
  display: flex;
  justify-content: center;
}

/* Each star: pointer and proper spacing */
.star {
  cursor: pointer;
  font-size: 1.2rem;
  margin: 0 0.1rem;
}

/* Submit check mark styling */
.submit-rating {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  color: green;
  cursor: pointer;
}

/* Job footer: ensure the 'Apply Now' link is on the left and rating container on the right */
.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

#careerGoalContainer {
  font-size: 1.2rem; /* You can adjust the value as desired */
}
