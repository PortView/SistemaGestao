import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Aplicar tema escuro ao body
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = '#000';
document.body.style.color = '#fff';

// Garantir que o elemento root existe
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.style.backgroundColor = '#000';
  rootElement.style.minHeight = '100vh';
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log("Aplicação renderizada com tema escuro");
} else {
  console.error("Elemento root não encontrado!");
}
