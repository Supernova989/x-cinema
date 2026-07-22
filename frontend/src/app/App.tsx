import './App.css'
import {AppProviders} from "./providers.tsx";
import {AppRouter} from "./router.tsx";

function App() {
  return (
      <AppProviders>
          <AppRouter>

          </AppRouter>
      </AppProviders>
  )
}

export default App
