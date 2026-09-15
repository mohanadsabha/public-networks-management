import { BrowserRouter } from "react-router-dom";
import { DocumentTitle } from "@/components/layout/DocumentTitle";
import { AppRouter } from "./router";

export function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <AppRouter />
    </BrowserRouter>
  );
}
