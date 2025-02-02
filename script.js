// ===== FOOTER YEAR =====
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ===== FILE UPLOAD =====
const fileDropZone = document.getElementById("fileDropZone");
const resumeInput = document.getElementById("resumeInput");
const fileInfo = document.getElementById("fileInfo");

if (fileDropZone && resumeInput && fileInfo) {
  fileDropZone.addEventListener("click", () => resumeInput.click());
  resumeInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      showFileInfo(e.target.files[0]);
    }
  });
  fileDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = "#1976d2";
  });
  fileDropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = "#ccc";
  });
  fileDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = "#ccc";
    if (e.dataTransfer.files.length > 0) {
      resumeInput.files = e.dataTransfer.files;
      showFileInfo(e.dataTransfer.files[0]);
    }
  });
}

function showFileInfo(file) {
  const validExtensions = ["pdf", "doc", "docx"];
  const ext = file.name.split(".").pop().toLowerCase();
  fileInfo.innerHTML = "";
  if (!validExtensions.includes(ext)) {
    fileInfo.textContent = "Error: Please upload a valid PDF, DOC, or DOCX file.";
    resumeInput.value = "";
    return;
  }
  const sizeKB = (file.size / 1024).toFixed(2);
  const infoText = `Selected File: ${file.name} (${sizeKB} KB)`;
  fileInfo.textContent = infoText;
  // "Remove File" button
  const removeBtn = document.createElement("button");
  removeBtn.textContent = " ×";
  removeBtn.style.marginLeft = "10px";
  removeBtn.style.backgroundColor = "#d32f2f";
  removeBtn.style.color = "#fff";
  removeBtn.style.border = "none";
  removeBtn.style.padding = "0.4rem 0.8rem";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.borderRadius = "4px";
  removeBtn.style.fontSize = "0.9rem";
  removeBtn.addEventListener("click", () => {
    resumeInput.value = "";
    fileInfo.innerHTML = "";
  });
  fileInfo.appendChild(removeBtn);
}

// ===== SKILLS ARRAYS =====
let selectedHardSkills = [];
let selectedSoftSkills = [];
let selectedJobPreferences = [];

// References for skills inputs and display containers
const hardSkillsInput = document.getElementById("hardSkills");
const selectedHardSkillsContainer = document.getElementById("selectedHardSkills");

const softSkillsInput = document.getElementById("softSkills");
const selectedSoftSkillsContainer = document.getElementById("selectedSoftSkills");

const jobPreferencesInput = document.getElementById("jobPreferences");
const selectedJobPreferencesContainer = document.getElementById("selectedJobPreferences");

// Render chips helper function
function renderSkillChips(skillsArray, container) {
  container.innerHTML = "";
  skillsArray.forEach((skill, idx) => {
    const chip = document.createElement("div");
    chip.classList.add("skill-chip");
    chip.textContent = skill;
    const removeBtn = document.createElement("span");
    removeBtn.textContent = " ×";
    removeBtn.classList.add("remove-skill-btn");
    removeBtn.addEventListener("click", () => {
      skillsArray.splice(idx, 1);
      renderSkillChips(skillsArray, container);
    });
    chip.appendChild(removeBtn);
    container.appendChild(chip);
  });
}

hardSkillsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addHardSkill();
  }
});
hardSkillsInput.addEventListener("blur", addHardSkill);
function addHardSkill() {
  const val = hardSkillsInput.value.trim();
  if (val && !selectedHardSkills.includes(val)) {
    selectedHardSkills.push(val);
    renderSkillChips(selectedHardSkills, selectedHardSkillsContainer);
  }
  hardSkillsInput.value = "";
}

softSkillsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addSoftSkill();
  }
});
softSkillsInput.addEventListener("blur", addSoftSkill);
function addSoftSkill() {
  const val = softSkillsInput.value.trim();
  if (val && !selectedSoftSkills.includes(val)) {
    selectedSoftSkills.push(val);
    renderSkillChips(selectedSoftSkills, selectedSoftSkillsContainer);
  }
  softSkillsInput.value = "";
}

jobPreferencesInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addJobPreference();
  }
});
jobPreferencesInput.addEventListener("blur", addJobPreference);
function addJobPreference() {
  const jp = jobPreferencesInput.value.trim();
  if (!jp) {
    jobPreferencesInput.value = "";
    return;
  }
  if (selectedJobPreferences.length >= 3) {
    alert("You can only select up to 3 job preferences.");
    jobPreferencesInput.value = "";
    return;
  }
  if (!selectedJobPreferences.includes(jp)) {
    selectedJobPreferences.push(jp);
    renderSkillChips(selectedJobPreferences, selectedJobPreferencesContainer);
  }
  jobPreferencesInput.value = "";
}

// ===== UI ELEMENTS for Form, Loading, and Results =====
const analyzeButton = document.getElementById("analyzeButton");
const loadingOverlay = document.getElementById("loadingOverlay");
const resultsPage = document.getElementById("resultsPage");
const recommendedJobsContainer = document.getElementById("recommendedJobsContainer");
const regenerateButton = document.getElementById("regenerateButton");
const inputContainer = document.getElementById("inputContainer");

// This function creates the job entry HTML consistently.
function createJobEntryHTML(job) {
  return `
    <h3>${job.title} @ ${job.company}</h3>
    <p>Salary: ${job.salary}</p>
    <p>Similarity: ${job.similarity}</p>
    <div class="job-footer">
      <a href="${job.link}" target="_blank">Apply Now</a>
      <div class="rating-container" data-jobid="${job.jobId}">
        <div class="rating-label">How Relevant Is This Posting</div>
        <div class="stars-wrapper">
          <div class="stars">
            <span class="star" data-value="1">☆</span>
            <span class="star" data-value="2">☆</span>
            <span class="star" data-value="3">☆</span>
            <span class="star" data-value="4">☆</span>
            <span class="star" data-value="5">☆</span>
          </div>
          <span class="submit-rating" style="display: none; color: green; cursor: pointer;">✔</span>
        </div>
      </div>
    </div>
    <hr/>
  `;
}


function renderJobs(jobsArray) {
  recommendedJobsContainer.innerHTML = "";
  const jobBox = document.createElement("div");
  jobBox.className = "recommended-job-box"; // single overall box
  jobsArray.forEach((job) => {
    const jobEntry = document.createElement("div");
    jobEntry.className = "job-entry";
    jobEntry.innerHTML = createJobEntryHTML(job);
    jobBox.appendChild(jobEntry);
  });
  recommendedJobsContainer.appendChild(jobBox);
  attachRatingListeners();
}

if (analyzeButton) {
  analyzeButton.addEventListener("click", () => {
    // Validate username
    const username = document.getElementById("usernameInput").value.trim();
    if (!username) {
      alert("Please enter a username.");
      return;
    }
    // Validate resume file
    if (!resumeInput.files.length) {
      alert("Please select a resume file first.");
      return;
    }
    const file = resumeInput.files[0];

    // Show the loading overlay
    loadingOverlay.style.display = "flex";

    // Build FormData with username, resume, and skills arrays (as JSON strings)
    const formData = new FormData();
    formData.append("username", username);
    formData.append("resume", file);
    formData.append("hardSkills", JSON.stringify(selectedHardSkills));
    formData.append("softSkills", JSON.stringify(selectedSoftSkills));
    formData.append("jobPreferences", JSON.stringify(selectedJobPreferences));

    // Send POST request to /analyze
    fetch("/analyze", {
      method: "POST",
      body: formData
    })
    .then(async (res) => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Server returned invalid JSON.");
      }
      if (!res.ok) {
        throw new Error(data.error || "Unknown error from server.");
      }
      return data;
    })
    .then((data) => {
      loadingOverlay.style.display = "none";
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      inputContainer.style.display = "none";
      resultsPage.style.display = "block";

      // Sort jobs by similarity (largest first)
      const sortedJobs = data.recommendedJobs.sort(
        (a, b) => parseFloat(b.similarity) - parseFloat(a.similarity)
      );
      renderJobs(sortedJobs);

      // Populate user summary and career goal
      const summaryContainer = document.getElementById("userSummaryContainer");
      const careerGoalContainer = document.getElementById("careerGoalContainer");
      if (summaryContainer && careerGoalContainer && data.userSummary) {
        summaryContainer.innerHTML = `
          <h3>User Summary</h3>
          <p><strong>Achievements:</strong> ${data.userSummary.achievements}</p>
          <p><strong>Skills:</strong> ${data.userSummary.skills}</p>
          <p><strong>Education:</strong> ${data.userSummary.education}</p>
          <p><strong>Improvement Suggestions:</strong> ${data.userSummary.improvements}</p>
        `;

        careerGoalContainer.innerHTML = `
          <h3>Career Goal</h3>
          <p><strong>Target Role:</strong> ${data.userSummary.careerGoal.title}</p>
          <p><strong>Duties:</strong> ${data.userSummary.careerGoal.reason}</p>
          <p><strong>Education Needed:</strong> ${data.userSummary.careerGoal.education}</p>
          <p><strong>Certifications:</strong> ${data.userSummary.careerGoal.certifications.join(", ")}</p>
          <p><strong>Experience Required:</strong> ${data.userSummary.careerGoal.experience}</p>
        `;
      }

      // Store userId for later use
      regenerateButton.dataset.userid = data.userId;
    })
    .catch((err) => {
      loadingOverlay.style.display = "none";
      console.error(err);
      alert("An error occurred: " + err.message);
    });
  });
}

if (regenerateButton) {
  regenerateButton.addEventListener("click", () => {
    const userId = regenerateButton.dataset.userid;
    if (!userId) {
      alert("No userId found. Please analyze first.");
      return;
    }
    loadingOverlay.style.display = "flex";
    fetch("/regenerate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ userId })
    })
    .then(async (res) => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Server returned invalid JSON on regenerate.");
      }
      if (!res.ok) {
        throw new Error(data.error || "Unknown error on regenerate.");
      }
      return data;
    })
    .then((data) => {
      loadingOverlay.style.display = "none";
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      const sortedJobs = data.recommendedJobs.sort(
        (a, b) => parseFloat(b.similarity) - parseFloat(a.similarity)
      );
      renderJobs(sortedJobs);
    })
    .catch((err) => {
      loadingOverlay.style.display = "none";
      console.error(err);
      alert("Error regenerating: " + err.message);
    });
  });
}

// Attach rating listeners to each rating container
function attachRatingListeners() {
  document.querySelectorAll(".rating-container").forEach(container => {
    const stars = container.querySelectorAll(".star");
    const submitRating = container.querySelector(".submit-rating");
    stars.forEach(star => {
      star.addEventListener("click", function() {
        const ratingValue = parseInt(this.getAttribute("data-value"));
        stars.forEach(s => {
          const value = parseInt(s.getAttribute("data-value"));
          if (value <= ratingValue) {
            s.textContent = "★";
            s.style.color = "gold";
          } else {
            s.textContent = "☆";
            s.style.color = "black";
          }
        });
        submitRating.style.display = "inline";
        container.dataset.selectedRating = ratingValue;
      });
    });
    submitRating.addEventListener("click", function() {
      const ratingValue = container.dataset.selectedRating;
      const jobId = container.getAttribute("data-jobid");
      const userId = regenerateButton.dataset.userid;
      if (!userId) {
        alert("User ID not found!");
        return;
      }
      fetch("/rate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userId: userId, jobId: jobId, rating: ratingValue })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          alert("Rating submitted successfully!");
          stars.forEach(s => s.style.pointerEvents = "none");
          submitRating.style.pointerEvents = "none";
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error submitting rating.");
      });
    });
  });
}
