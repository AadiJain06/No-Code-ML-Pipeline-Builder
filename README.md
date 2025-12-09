# No-Code ML Pipeline Builder

A web-based, no-code Machine Learning pipeline builder that allows users to create and run ML workflows without writing code. Built with React frontend and Flask backend.

## Features

✅ **Dataset Upload** - Upload CSV or Excel files with automatic validation  
✅ **Data Preprocessing** - Apply Standardization or Normalization  
✅ **Train-Test Split** - Configurable split ratios (70-30, 80-20, etc.)  
✅ **Model Selection** - Choose between Logistic Regression and Decision Tree Classifier  
✅ **Results Visualization** - View accuracy, confusion matrix, and classification reports  
✅ **Step-based Pipeline** - Visual flow builder with progress tracking  

## Project Structure

```
Assign/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── PipelineBuilder.js
│   │   │   ├── PipelineFlow.js
│   │   │   ├── StepUpload.js
│   │   │   ├── StepPreprocess.js
│   │   │   ├── StepSplit.js
│   │   │   ├── StepModel.js
│   │   │   └── StepResults.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json        # Node dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Usage Guide

### Step 1: Upload Dataset
- Click or drag & drop a CSV or Excel file
- The system will display dataset information (rows, columns, data types, missing values)
- A preview of the first 10 rows will be shown

### Step 2: Preprocess Data
- Select the target column (the variable you want to predict)
- Choose a preprocessing method:
  - **Standardization**: Scales features to mean=0, std=1
  - **Normalization**: Scales features to range [0, 1]
- Click "Apply Preprocessing"

### Step 3: Split Data
- Choose a train-test split ratio (70-30, 80-20, etc.)
- Or enter a custom ratio (0.1 to 0.5)
- Click "Perform Train-Test Split"
- Visual representation shows the split distribution

### Step 4: Select & Train Model
- Choose a model:
  - **Logistic Regression**: Fast, interpretable, good for linear relationships
  - **Decision Tree Classifier**: Handles non-linear relationships well
- Click "Train Model"
- View training results including accuracy and confusion matrix

### Step 5: View Results
- Review model performance metrics
- Examine confusion matrix visualization
- View detailed classification report
- Start a new pipeline when done

## API Endpoints

- `POST /api/upload` - Upload dataset file
- `POST /api/preprocess` - Apply preprocessing
- `POST /api/split` - Perform train-test split
- `POST /api/train` - Train selected model
- `GET /api/pipeline/status` - Get pipeline status
- `POST /api/reset` - Reset pipeline

## Technologies Used

**Frontend:**
- React 18
- Axios for API calls
- React Dropzone for file uploads
- CSS3 with modern styling

**Backend:**
- Flask (Python web framework)
- scikit-learn (Machine Learning)
- pandas (Data manipulation)
- numpy (Numerical operations)
- matplotlib & seaborn (Visualizations)

## Notes

- The application handles both numeric and categorical target variables
- Only numeric features are used for preprocessing and modeling
- The pipeline state is maintained in the backend for the session
- All visualizations are generated server-side and sent as base64 images

## Troubleshooting

**Backend not starting:**
- Ensure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 5000 is not in use

**Frontend not connecting to backend:**
- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify API endpoints in the frontend code match backend routes

**File upload issues:**
- Ensure file is CSV or Excel format (.csv, .xls, .xlsx)
- Check file size (very large files may take time to process)
- Verify file has valid data structure

## Future Enhancements

- Support for regression models
- Additional preprocessing options (handling missing values, feature selection)
- Model comparison and selection
- Export trained models
- Support for more file formats
- Real-time pipeline visualization

## License

This project is created for educational/assignment purposes.

