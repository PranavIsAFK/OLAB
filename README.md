# OLAP System - Optimal Load Allocation for Packages

A Smart Logistics Resource Allocation System that helps logistics companies maximize profit when loading packages into a truck using the 0/1 Knapsack Algorithm (Dynamic Programming).

## 🎯 Core Objective

The system selects the most profitable combination of packages without exceeding the truck's weight capacity using Dynamic Programming optimization.

## 🚀 Features

### Core Functionality
- **Package Management**: Add, remove, and manage packages with weight and profit values
- **Dynamic Programming**: Implements 0/1 Knapsack algorithm for optimal solution
- **DP Table Visualization**: Interactive table showing how the solution is built step-by-step
- **Real-time Results**: Display selected packages, total weight, profit, and efficiency

### Advanced Features
- **Multiple Sorting Options**: Sort packages by profit, weight, or profit/weight ratio
- **Algorithm Comparison**: Compare DP with Greedy and Random selection approaches
- **Performance Analytics**: Truck efficiency percentage and profit improvement analysis
- **Save/Load Functionality**: Save datasets and load them later
- **Sample Data**: Pre-loaded sample dataset for immediate testing

### Visualization
- **Interactive DP Table**: Hover effects and highlighting for selected items
- **Performance Charts**: Bar charts comparing different algorithms
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

## 🧮 Algorithm Explanation

### 0/1 Knapsack Problem
The 0/1 Knapsack Problem is a classic optimization problem where:
- We have items (packages) with weights and values (profits)
- We have a capacity constraint (truck capacity)
- Each item can be either taken (1) or not taken (0)
- Goal: Maximize total value without exceeding capacity

### Dynamic Programming Solution
- **Time Complexity**: O(n×W) where n = number of items, W = capacity
- **Space Complexity**: O(n×W)
- **Guarantees**: Optimal solution every time
- **Method**: Build solution table bottom-up, then backtrack to find selected items

## 🖥️ How to Use

1. **Set Truck Capacity**: Enter the maximum weight capacity of your truck
2. **Add Packages**: Click "Add Package" or "Load Sample Data"
3. **Sort (Optional)**: Sort packages by profit, weight, or profit/weight ratio
4. **Optimize**: Click "Optimize Load" to run the DP algorithm
5. **View Results**: See selected packages, total profit, and efficiency
6. **Compare (Optional)**: Click "Compare Algorithms" to see performance differences
7. **Save/Load**: Save your dataset for future use

## 📊 Sample Data

The system includes 8 sample packages:
- PKG-1: 10kg, $60 profit
- PKG-2: 20kg, $100 profit
- PKG-3: 30kg, $120 profit
- PKG-4: 15kg, $80 profit
- PKG-5: 25kg, $110 profit
- PKG-6: 12kg, $70 profit
- PKG-7: 18kg, $90 profit
- PKG-8: 8kg, $45 profit

Default truck capacity: 50kg

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS for modern, responsive design
- **Charts**: Chart.js for algorithm comparison visualization
- **Algorithm**: Dynamic Programming implementation of 0/1 Knapsack

## 📁 File Structure

```
OLAP/
├── index.html          # Main application interface
├── script.js           # Core JavaScript functionality
└── README.md          # Project documentation
```

## 🎓 Educational Value

This system demonstrates:
- **Dynamic Programming**: Real-world application of DP algorithms
- **Optimization Problems**: Practical solution to logistics challenges
- **Algorithm Comparison**: Understanding trade-offs between different approaches
- **Data Visualization**: Making complex algorithms understandable
- **Software Engineering**: Clean, modular code structure

## 🚀 Getting Started

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. The system is ready to use with sample data loaded

## 📈 Algorithm Performance

For the sample dataset (50kg capacity):
- **Dynamic Programming**: Always finds optimal solution
- **Greedy Approach**: Fast but may miss optimal combinations
- **Random Selection**: Baseline for comparison
- **Typical Improvement**: DP often provides 10-30% better profit than greedy

## 🔮 Future Enhancements

- Multiple truck simulation
- Additional constraints (fragile items, priority deliveries)
- Advanced analytics dashboard
- Export results to PDF/Excel
- Integration with logistics APIs
- Machine learning for demand prediction

## 📞 Support

This project is designed for educational purposes and demonstrates the practical application of computer science algorithms in real-world logistics optimization.

---

**OLAP System** - Smart Logistics Resource Allocation using Dynamic Programming
