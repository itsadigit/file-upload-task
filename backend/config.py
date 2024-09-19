# config.py
import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Admin3306@sql',
        database='file_upload_db'
    )
