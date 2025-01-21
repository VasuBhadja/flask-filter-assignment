from flask import Flask, render_template, request, send_file, jsonify, url_for
import json
import pandas as pd
import io

app = Flask(__name__)

# Sample data
data = [
    {"name": "Alice", "age": 30, "city": "New York"},
    {"name": "Bob", "age": 25, "city": "Los Angeles"},
    {"name": "Charlie", "age": 35, "city": "Chicago"}
]


with open('columns.json') as f:
    columns = json.load(f)
    print("Filters are: ",columns)

@app.route('/')
def index():
    return render_template('index.html')

filtered_data=data

@app.route('/filter',methods=['GET','POST'])
def filter_data():
    global filtered_data
    filtered_data = data
    applied_filters={}
    if request.method=="POST":
        print("Request from Items:", request.form.items)
        for key,value in request.form.items():
            if value:
                applied_filters[key]=value
                filtered_data = [d for d in filtered_data if (str(d[key]) == value)]
    return render_template('filter.html', data=filtered_data, columns=columns,applied_filters=applied_filters)

@app.route('/download/<file_format>',methods=['POST'])
def download_data(file_format):
    df= pd.DataFrame(filtered_data)

    if file_format == 'csv':
        output = io.StringIO()
        df.to_csv(output,index=False)
        output.seek(0)
        return send_file(io.BytesIO(output.getvalue().encode()),mimetype='text/csv',as_attachment=True,download_name='filtered_data.csv')
    elif file_format == 'excel':
        output = io.BytesIO()
        with pd.ExcelWriter(output,engine='openpyxl') as writer:
            df.to_excel(writer,index=False,sheet_name='Filtered Data')
        output.seek(0)
        return send_file(output,mimetype='application/vnd.openxmlformats-officedocument.spreadsheet.sheet',as_attachment=True,download_name='filtered_data.xlsx')

@app.route('/save_filters',methods=['POST'])
def save_filters():
    new_filter = request.json
    try:
        with open('saved_filters.json','r+') as f:
            try:
                saved_filters=json.load(f)
            except json.JSONDecodeError:
                saved_filters= []
            saved_filters.append(new_filter)
            f.seek(0)
            json.dump(saved_filters,f)
    except FileNotFoundError:
        raise Exception("File not found.")
    
    return jsonify({"message": "Filters saved successfully"}), 200

@app.route('/get_saved_filters',methods=['GET'])
def get_saved_filters():
    print("Inside get_saved_filters")
    with open('saved_filters.json','r') as f:
        try:
            saved_filters = json.load(f)
            print("Type of Saved_Filters: ",type(saved_filters))
        except json.JSONDecodeError:
            saved_filters=[]
    return jsonify({"saved_filters":saved_filters})

@app.route('/get-filtered-data', methods=['GET'])
def get_filtered_data():
    return jsonify({"filtered_data":filtered_data})