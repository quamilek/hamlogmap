from flask import Flask, render_template, request, redirect, url_for, flash
from qsomap.upload import upload_bp

app = Flask(__name__, 
            template_folder='qsomap/templates',
            static_folder='qsomap/static',
            static_url_path='/static')
app.secret_key = 'your_secret_key'  
app.register_blueprint(upload_bp)

@app.route('/')
def index():
    return render_template('main.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
