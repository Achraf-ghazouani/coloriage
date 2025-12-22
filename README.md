# 🎨 Coloriage Dashboard

A real-time dashboard for displaying data from your Unity coloring application. Track user names, most used colors, and design time.

## 📋 Features

- **Real-time data display** from Unity application
- **Statistics overview**: Total users, average design time, most popular color
- **Interactive table** showing all submissions
- **Auto-refresh** functionality (every 5 seconds)
- **Responsive design** works on desktop and mobile
- **Easy integration** with Unity via HTTP POST

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- Unity 2019.4 or higher (for the Unity script)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open the dashboard:**
   - Open your browser and go to: `http://localhost:3000`
   - The dashboard will be ready to receive data!

## 🎮 Unity Integration

### Setup in Unity

1. Copy the `Unity/DashboardReporter.cs` script to your Unity project's `Assets/Scripts` folder

2. Attach the script to any GameObject in your scene

3. Configure the script in the Inspector:
   - **Dashboard URL**: `http://localhost:3000/api/data` (default)
   - **User Name**: The name to send to the dashboard
   - **Most Used Color**: Initial color value

### Using the Script

#### Basic Usage

```csharp
// Get reference to the script
DashboardReporter reporter = GetComponent<DashboardReporter>();

// Track when user uses a color
reporter.TrackColorUsage("#FF5733");

// When user finishes their design, send data
reporter.SendDataToDashboard();
```

#### Track Colors

```csharp
// Track color usage (hex string)
reporter.TrackColorUsage("#FF5733");

// Or track Unity Color
Color myColor = Color.red;
reporter.TrackColorUsage(myColor);
```

#### Send Custom Data

```csharp
string userName = "Alice";
string favoriteColor = "#FF5733";
float timeSpent = 125.5f; // seconds

reporter.SendDataToDashboard(userName, favoriteColor, timeSpent);
```

#### Example: Button Click

```csharp
public class GameManager : MonoBehaviour
{
    public DashboardReporter reporter;
    
    // Call this when user clicks "Submit" button
    public void OnSubmitDesign()
    {
        reporter.SendDataToDashboard();
    }
}
```

## 🔌 API Endpoints

### Send Data (POST)
```
POST http://localhost:3000/api/data
Content-Type: application/json

{
  "name": "Player1",
  "mostUsedColor": "#FF5733",
  "designTime": 125.5
}
```

### Get All Data (GET)
```
GET http://localhost:3000/api/data
```

### Clear All Data (DELETE)
```
DELETE http://localhost:3000/api/data
```

## 🎨 Dashboard Features

### Statistics Cards
- **Total Users**: Number of submissions received
- **Avg. Design Time**: Average time users spent designing
- **Most Popular Color**: The color used most across all users

### Controls
- **🔄 Refresh**: Manually refresh the data
- **🗑️ Clear All Data**: Remove all stored data
- **Auto-refresh toggle**: Enable/disable automatic refresh (every 5 seconds)

### Data Table
Shows all submissions with:
- Timestamp of submission
- User name
- Most used color (with visual color badge)
- Design time

## 🛠️ Customization

### Change Port

Edit `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

### Change Auto-refresh Interval

Edit `public/script.js`:
```javascript
autoRefreshInterval = setInterval(loadData, 5000); // 5000ms = 5 seconds
```

### Styling

All styles are in `public/styles.css`. You can customize:
- Colors
- Fonts
- Layout
- Animations

## 📝 Testing Without Unity

You can test the dashboard using the test script:

```bash
node test-send-data.js
```

Or manually using curl:

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","mostUsedColor":"#FF5733","designTime":60}'
```

## 🐛 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

### Unity can't send data
- Make sure the server is running
- Check the Unity Console for error messages
- Verify the URL in DashboardReporter script matches your server
- Try testing with curl/Postman first

### CORS errors
- The server has CORS enabled by default
- If you need specific origins, edit `server.js`

### Data not showing
- Click the "Refresh" button manually
- Check browser console (F12) for errors
- Verify server is receiving data (check server console logs)

## 📦 Project Structure

```
coloriage/
├── server.js              # Backend server
├── package.json           # Node.js dependencies
├── public/                # Frontend files
│   ├── index.html         # Dashboard HTML
│   ├── styles.css         # Dashboard styles
│   └── script.js          # Dashboard JavaScript
├── Unity/                 # Unity integration
│   └── DashboardReporter.cs
└── README.md             # This file
```

## 🔒 Production Deployment

For production use, consider:

1. **Using a database** (MongoDB, PostgreSQL) instead of in-memory storage
2. **Adding authentication** to protect your endpoints
3. **Using environment variables** for configuration
4. **Deploying to a cloud service** (Heroku, AWS, Azure)
5. **Adding HTTPS** for secure communication

## 📄 License

MIT License - Feel free to use this in your projects!

## 🤝 Support

If you encounter any issues or have questions, please check the troubleshooting section or review the code comments for more details.

---

Happy coding! 🎨✨
