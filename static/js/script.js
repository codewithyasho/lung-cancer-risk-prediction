// JavaScript for Lung Cancer Risk Predictor

document.addEventListener("DOMContentLoaded", function () {
  // Load past predictions on page load
  loadPastPredictions();

  // Form submission handler
  document
    .getElementById("predictionForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if consent is given
      if (!document.getElementById("consent").checked) {
        alert("You must agree to the disclaimer to proceed.");
        return;
      }

      // Add loading state to submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';
      submitBtn.disabled = true;

      // Collect form data
      const formData = collectFormData();

      // Make prediction request
      fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Restore button
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;

          if (data.success) {
            displayResults(data, formData);
            loadPastPredictions(); // Refresh past predictions
          } else {
            alert("Error: " + data.error);
          }
        })
        .catch((error) => {
          // Restore button
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          console.error("Error:", error);
          alert("An error occurred while making the prediction.");
        });
    });
});

function collectFormData() {
  const formData = {
    full_name: document.getElementById("full_name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    smoking: getRadioValue("smoking"),
    yellow_fingers: getRadioValue("yellow_fingers"),
    anxiety: getRadioValue("anxiety"),
    chronic_disease: getRadioValue("chronic_disease"),
    fatigue: getRadioValue("fatigue"),
    allergy: getRadioValue("allergy"),
    wheezing: getRadioValue("wheezing"),
    alcohol_consuming: getRadioValue("alcohol_consuming"),
    coughing: getRadioValue("coughing"),
    shortness_of_breath: getRadioValue("shortness_of_breath"),
    swallowing_difficulty: getRadioValue("swallowing_difficulty"),
    chest_pain: getRadioValue("chest_pain"),
  };

  return formData;
}

function getRadioValue(name) {
  const radios = document.getElementsByName(name);
  for (let radio of radios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return "NO"; // Default value
}

function displayResults(data, formData) {
  const resultsSection = document.getElementById("resultsSection");
  const predictionResult = document.getElementById("predictionResult");

  // Create result display
  const resultClass = data.is_high_risk ? "high-risk" : "low-risk";
  const icon = data.is_high_risk ? "⚠️" : "🧠";

  predictionResult.innerHTML = `
        <div class="prediction-result ${resultClass} fade-in">
            ${icon} Prediction: ${data.prediction}
        </div>
    `;

  // Display the plot
  const graphDiv = document.getElementById("plotDiv");
  Plotly.newPlot(
    graphDiv,
    JSON.parse(data.graph).data,
    JSON.parse(data.graph).layout,
    { responsive: true }
  );

  // Show results section
  resultsSection.classList.remove("d-none");
  resultsSection.scrollIntoView({ behavior: "smooth" });

  // Setup download button
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.onclick = function () {
    downloadReport(formData, data.prediction, data.probability);
  };
}

function downloadReport(formData, result, probability) {
  const reportData = {
    name: formData.full_name,
    form_data: {
      AGE: parseInt(formData.age),
      GENDER: formData.gender,
      SMOKING: formData.smoking,
      YELLOW_FINGERS: formData.yellow_fingers,
      ANXIETY: formData.anxiety,
      CHRONIC_DISEASE: formData.chronic_disease,
      FATIGUE: formData.fatigue,
      ALLERGY: formData.allergy,
      WHEEZING: formData.wheezing,
      ALCOHOL_CONSUMING: formData.alcohol_consuming,
      COUGHING: formData.coughing,
      SHORTNESS_OF_BREATH: formData.shortness_of_breath,
      SWALLOWING_DIFFICULTY: formData.swallowing_difficulty,
      CHEST_PAIN: formData.chest_pain,
    },
    result: result,
    probability: probability,
  };

  fetch("/download_report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportData),
  })
    .then((response) => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error("Network response was not ok.");
    })
    .then((blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "Lung_Cancer_Prediction_Report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error downloading report. Please try again.");
    });
}

function loadPastPredictions() {
  fetch("/get_past_predictions")
    .then((response) => response.json())
    .then((predictions) => {
      if (predictions.length > 0) {
        displayPastPredictions(predictions);
      }
    })
    .catch((error) => {
      console.error("Error loading past predictions:", error);
    });
}

function displayPastPredictions(predictions) {
  const section = document.getElementById("pastPredictionsSection");
  const content = document.getElementById("pastPredictionsContent");

  let html = "";

  // Show last 5 predictions in reverse order
  const recentPredictions = predictions.slice(-5).reverse();

  recentPredictions.forEach((prediction, index) => {
    const runNumber = predictions.length - index;
    const color = prediction.result === "High Risk" ? "#dc3545" : "#28a745";
    const icon = prediction.result === "High Risk" ? "⚠️" : "✅";

    html += `
            <div class="past-prediction-item slide-in">
                <div class="past-prediction-header" onclick="togglePrediction(${index})" style="background-color: ${color}; color: white;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${icon} Run #${runNumber} - ${
      prediction.result
    } (${prediction.name})</span>
                        <i class="fas fa-chevron-down" id="chevron-${index}"></i>
                    </div>
                </div>
                <div class="past-prediction-content d-none" id="content-${index}">
                    <div class="row">
                        <div class="col-md-8">
                            <h6>Input Data:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    ${createDataTable(prediction.data)}
                                </table>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <div class="prediction-result ${
                                  prediction.result === "High Risk"
                                    ? "high-risk"
                                    : "low-risk"
                                }" style="font-size: 1rem; padding: 10px;">
                                    Prediction: ${prediction.result}
                                </div>
                                <p class="mt-2 mb-0"><strong>Confidence:</strong> ${(
                                  prediction.probability * 100
                                ).toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  content.innerHTML = html;
  section.classList.remove("d-none");
}

function createDataTable(data) {
  let tableHTML = "";
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i += 2) {
    tableHTML += "<tr>";
    tableHTML += `<td><strong>${keys[i].replace(/_/g, " ")}:</strong></td>`;
    tableHTML += `<td>${data[keys[i]]}</td>`;

    if (keys[i + 1]) {
      tableHTML += `<td><strong>${keys[i + 1].replace(
        /_/g,
        " "
      )}:</strong></td>`;
      tableHTML += `<td>${data[keys[i + 1]]}</td>`;
    } else {
      tableHTML += "<td></td><td></td>";
    }
    tableHTML += "</tr>";
  }

  return tableHTML;
}

function togglePrediction(index) {
  const content = document.getElementById(`content-${index}`);
  const chevron = document.getElementById(`chevron-${index}`);

  if (content.classList.contains("d-none")) {
    content.classList.remove("d-none");
    chevron.classList.remove("fa-chevron-down");
    chevron.classList.add("fa-chevron-up");
  } else {
    content.classList.add("d-none");
    chevron.classList.remove("fa-chevron-up");
    chevron.classList.add("fa-chevron-down");
  }
}

function showAlert(type, message) {
  const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

  // Insert alert at the top of the main content
  const mainContent = document.querySelector(".main-content .container");
  mainContent.insertAdjacentHTML("afterbegin", alertHTML);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = document.querySelector(".alert");
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 5000);
}

// Form validation and enhancement
function validateForm() {
  const requiredFields = ["full_name"];
  let isValid = true;

  requiredFields.forEach((field) => {
    const element = document.getElementById(field);
    if (!element.value.trim()) {
      element.classList.add("is-invalid");
      isValid = false;
    } else {
      element.classList.remove("is-invalid");
    }
  });

  return isValid;
}

// Add input event listeners for real-time validation
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input[required], select[required]");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      }
    });
  });
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add loading states to buttons
function addLoadingState(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
  button.disabled = true;

  return function () {
    button.innerHTML = originalHTML;
    button.disabled = false;
  };
}

// Enhanced form submission with loading state
document
  .getElementById("predictionForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      showAlert("danger", "Please fill in all required fields.");
      return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const removeLoading = addLoadingState(submitBtn);

    // Continue with existing form submission logic...
    setTimeout(removeLoading, 100); // Will be removed when actual request completes
  });
