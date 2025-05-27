import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {navItems.map((item) => (
            <Route key={item.to} path={item.to} element={item.page} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App; 