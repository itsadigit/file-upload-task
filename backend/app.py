from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import mysql.connector
from io  import BytesIO
from config import get_db_connection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp3', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    print("Upload route accessed")
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        print("File received:", file.filename)
        filename = secure_filename(file.filename)
        filetype = file.mimetype
        filedata = file.read()

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("INSERT INTO files (filename, filetype, filedata) VALUES (%s, %s, %s)", (filename, filetype, filedata))
            conn.commit()

            file_id = cursor.lastrowid
            cursor.close()
            conn.close()

            return jsonify({'message': 'File uploaded successfully', 'file_id': file_id}), 201

        except mysql.connector.Error as err:
            return jsonify({'error': str(err)}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400
    
@app.route('/file/<int:file_id>', methods=['GET'])
def get_file(file_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT filename, filetype, filedata FROM files WHERE id = %s", (file_id,))
        result = cursor.fetchone()

        if result:
            filename, filetype, filedata = result

            return send_file(BytesIO(filedata), as_attachment=True, mimetype=filetype, download_name=filename)

        else:
            return jsonify({'error': 'File not found'}), 404

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)