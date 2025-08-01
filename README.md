# Lung Cancer Risk Predictor - Flask Web Application

A beautiful, responsive web application that predicts lung cancer risk using machine learning. This Flask version features a modern UI with Bootstrap 5, custom CSS animations, and interactive JavaScript components.

## Features

### 🧠 AI-Powered Predictions

- **Random Forest Model**: Pre-trained ML model for accurate predictions
- **Real-time Analysis**: Instant risk assessment based on 14 health parameters
- **Visual Results**: Interactive gauge charts showing risk probability
- **Confidence Scores**: Detailed probability percentages for predictions

### 📊 Data Visualization

- **Plotly Integration**: Interactive gauge charts for risk visualization
- **Color-coded Results**: Green for low risk, red for high risk
- **Responsive Charts**: Charts adapt to different screen sizes

### 💾 Session Management

- **Past Predictions**: View history of last 5 predictions
- **Session Storage**: Temporary storage during browser session
- **Data Privacy**: No permanent data storage, all local processing

## Technology Stack

### Backend

- **Flask 2.3.3**: Python web framework
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning model
- **Joblib**: Model serialization
- **FPDF**: PDF report generation
- **Plotly**: Interactive chart generation

### Features

- **AJAX Requests**: Seamless form submissions
- **Loading States**: User feedback during processing
- **Form Validation**: Client-side validation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and semantic HTML

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Quick Start

1. **Clone or Download** the project to your local machine

2. **Navigate** to the project directory:

   ```bash
   cd Lung-Cancer-Risk-Predictor
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application**:

   ```bash
   python app.py
   ```

5. **Open Browser** and go to: `http://localhost:5000`

## Usage

### Making a Prediction

1. **Enter Personal Information**:

   - Full name (required)
   - Age (1-100 years)
   - Gender (Male/Female)

2. **Answer Medical Questions**:

   - 12 yes/no questions about health conditions
   - Each question includes helpful descriptions
   - Visual toggle buttons for easy selection

3. **Agree to Disclaimer**:

   - Check the consent checkbox
   - Acknowledges this is not medical advice

4. **Get Results**:
   - Click "Predict Risk" button
   - View animated results with risk level
   - See interactive probability gauge
   - Download detailed PDF report

### Understanding Results

- **Low Risk**: Green indicator, typically <50% probability
- **High Risk**: Red indicator, typically >50% probability
- **Confidence Score**: Shows model's certainty in prediction
- **Interactive Chart**: Visual representation of risk probability

## Model Information

### Input Features (14 parameters)

- **Demographics**: Age, Gender
- **Lifestyle**: Smoking, Alcohol consumption
- **Symptoms**: Yellow fingers, Anxiety, Fatigue, Allergy
- **Respiratory**: Wheezing, Coughing, Shortness of breath
- **Physical**: Swallowing difficulty, Chest pain
- **Medical**: Chronic disease

### Model Performance

- **Algorithm**: Random Forest Classifier
- **Training**: Pre-trained on medical dataset
- **Output**: Binary classification (High/Low risk)
- **Probability**: Confidence score (0-100%)

## Customization

### Functionality

- Extend `static/js/script.js` for new features
- Modify `app.py` for backend changes
- Update `templates/index.html` for UI changes

### Model

- Replace `RFC.pkl` with your trained model
- Update `columns.pkl` with new feature set
- Modify prediction logic in Flask app

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## Contact

**Developer**: Yashodeep Hundiwale  
**Email**: yashodeephundiwale@gmail.com  
**Purpose**: Educational Machine Learning Project

---

_Built with ❤️ using Flask, Bootstrap, and Machine Learning_
