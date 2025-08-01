from flask import Flask, render_template, request, jsonify, session, send_file
import pandas as pd
import joblib
import json
from fpdf import FPDF
from datetime import datetime
import plotly.graph_objects as go
import plotly.utils
import tempfile

app = Flask(__name__)


# Load the ML model and expected columns
model = joblib.load('RFC.pkl')
expected_columns = joblib.load('columns.pkl')


class StyledPDF(FPDF):
    def header(self):
        self.set_fill_color(70, 130, 180)
        self.rect(0, 0, 210, 20, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font("Arial", 'B', 16)
        self.cell(0, 10, "  Lung Cancer Risk Prediction Report", ln=True)
        self.ln(10)
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-20)
        self.set_font("Arial", 'I', 8)
        self.set_text_color(120, 120, 120)
        self.multi_cell(
            0, 5, "Disclaimer: This report is generated using an AI model and should not be treated as medical advice.\nPlease consult a certified healthcare provider.", 0, 'C')

    def data_row(self, col, value):
        self.set_font("Arial", '', 12)
        self.cell(90, 10, f"{col.replace('_', ' ').title()}:", border=1)
        self.cell(90, 10, str(value), border=1, ln=True)


def generate_pdf(full_name, df_display, prediction, proba):
    pdf = StyledPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, f"Name: {full_name}", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(
        0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.ln(5)

    for col in df_display.columns:
        val = df_display[col].values[0]
        pdf.data_row(col, val)

    result = "High Risk" if prediction == 1 else "Low Risk"
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.set_fill_color(
        220, 53, 69) if prediction == 1 else pdf.set_fill_color(40, 167, 69)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, f"Risk Prediction: {result}", ln=True, fill=True)
    pdf.cell(
        0, 10, f"Risk Probability: {proba * 100:.2f}%", ln=True, fill=True)
    pdf.set_text_color(0, 0, 0)

    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    pdf.output(temp_file.name)
    return temp_file.name


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug print

        # Extract form data
        full_name = data.get('full_name', '')
        age = int(data.get('age', 25))
        gender = data.get('gender', 'MALE')

        # Medical inputs
        smoking = data.get('smoking', 'NO')
        yellow_fingers = data.get('yellow_fingers', 'NO')
        anxiety = data.get('anxiety', 'NO')
        chronic_disease = data.get('chronic_disease', 'NO')
        fatigue = data.get('fatigue', 'NO')
        allergy = data.get('allergy', 'NO')
        wheezing = data.get('wheezing', 'NO')
        alcohol_consuming = data.get('alcohol_consuming', 'NO')
        coughing = data.get('coughing', 'NO')
        shortness_of_breath = data.get('shortness_of_breath', 'NO')
        swallowing_difficulty = data.get('swallowing_difficulty', 'NO')
        chest_pain = data.get('chest_pain', 'NO')

        # Prepare data for display
        display_input_data = [[age, gender, smoking, yellow_fingers, anxiety,
                               chronic_disease, fatigue, allergy, wheezing, alcohol_consuming,
                               coughing, shortness_of_breath, swallowing_difficulty, chest_pain]]

        df_display = pd.DataFrame(display_input_data, columns=[
            "AGE", "GENDER", "SMOKING", "YELLOW_FINGERS", "ANXIETY",
            "CHRONIC_DISEASE", "FATIGUE", "ALLERGY", "WHEEZING", "ALCOHOL_CONSUMING",
            "COUGHING", "SHORTNESS_OF_BREATH", "SWALLOWING_DIFFICULTY", "CHEST_PAIN"
        ])

        # Prepare data for model
        df_model = df_display.copy()
        gender_m_val = 1 if gender == 'MALE' else 0
        df_model['GENDER_M'] = gender_m_val
        df_model.drop(columns=["GENDER"], inplace=True)

        # Convert YES/NO to 1/0
        for col in df_model.columns:
            if df_model[col].dtype == 'object':
                df_model[col] = df_model[col].map({'YES': 1, 'NO': 0})

        print("Model input data:", df_model.values)  # Debug print
        print("Expected columns:", expected_columns)  # Debug print

        # Ensure columns match expected order
        df_model = df_model[expected_columns]

        # Make prediction
        prediction = int(model.predict(df_model)[0])  # Convert to Python int
        proba = float(model.predict_proba(df_model)[0][1])
        result_label = "High Risk" if prediction else "Low Risk"

        # Debug print
        print(
            f"Prediction: {prediction}, Probability: {proba}, Label: {result_label}")

        # Create gauge chart
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=proba * 100,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Risk Probability"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "#dc3545" if prediction == 1 else "#28a745"},
                'steps': [
                    {'range': [0, 50], 'color': 'lightgreen'},
                    {'range': [50, 100], 'color': 'lightcoral'}
                ]
            }
        ))

        # Convert plot to JSON
        graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

        # Store in session for past predictions
        if 'past_predictions' not in session:
            session['past_predictions'] = []

        prediction_data = {
            'name': full_name,
            'data': df_display.to_dict('records')[0],
            'result': result_label,
            'probability': proba
        }

        session['past_predictions'].append(prediction_data)
        # Keep only last 5 predictions
        session['past_predictions'] = session['past_predictions'][-5:]

        return jsonify({
            'success': True,
            'prediction': result_label,
            'probability': proba * 100,
            'graph': graphJSON,
            'is_high_risk': bool(prediction == 1)  # Ensure it's a Python bool
        })

    except Exception as e:
        print(f"Error in predict route: {str(e)}")  # Debug print
        import traceback
        traceback.print_exc()  # Print full traceback
        return jsonify({'success': False, 'error': str(e)})


@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        data = request.get_json()

        # Recreate the dataframe from the data
        df_display = pd.DataFrame([data['form_data']], columns=[
            "AGE", "GENDER", "SMOKING", "YELLOW_FINGERS", "ANXIETY",
            "CHRONIC_DISEASE", "FATIGUE", "ALLERGY", "WHEEZING", "ALCOHOL_CONSUMING",
            "COUGHING", "SHORTNESS_OF_BREATH", "SWALLOWING_DIFFICULTY", "CHEST_PAIN"
        ])

        prediction = 1 if data['result'] == 'High Risk' else 0
        proba = data['probability'] / 100

        pdf_path = generate_pdf(data['name'], df_display, prediction, proba)

        return send_file(pdf_path, as_attachment=True,
                         download_name='Lung_Cancer_Prediction_Report.pdf',
                         mimetype='application/pdf')
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/get_past_predictions')
def get_past_predictions():
    predictions = session.get('past_predictions', [])
    return jsonify(predictions)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

