import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import  Home  from "@/pages/home"

function App() {
  return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <Navbar />
          <Home/>
      </ThemeProvider>
  );
}

export default App;

