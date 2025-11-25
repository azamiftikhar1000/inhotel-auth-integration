import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useEffect } from "react";
import useGlobal from "./logic/hooks/useGlobal";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
  );

const queryClient = new QueryClient();

const MyApp = () => {

  const [colorMode = "dark" , setColorMode ] = useGlobal<'dark' | 'light'>(["colormode", "selected"]);

  useEffect(() => {
    const queryParameters = new URLSearchParams(
      window?.location?.href.split("?")[1]
    );
  
    const base64Decoded = queryParameters.get("data") || "";
  
    if (base64Decoded) {
      const jsonDecoded = atob(base64Decoded);
      console.log("🔍 jsonDecoded:", jsonDecoded);
      const decodedObject = JSON.parse(jsonDecoded);

      if (decodedObject?.appTheme) {
        localStorage.setItem('chakra-ui-color-mode', decodedObject?.appTheme);
        setColorMode(decodedObject?.appTheme);
      } else {
        localStorage.setItem('chakra-ui-color-mode', 'light');
        setColorMode('light');
      }
    } else {
      localStorage.setItem('chakra-ui-color-mode', 'dark');
      setColorMode('dark');
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    document.documentElement.setAttribute('style', `color-scheme: ${colorMode}`);
    document.body.className = `chakra-ui-${colorMode}`;
  }, [colorMode]);

  const theme = extendTheme({
    config: {
      initialColorMode: colorMode, 
      useSystemColorMode: false,
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: "500",
          padding: "0px 16px",
          fontSize: "14px",
          lineHeight: "20px",
          borderRadius: "6px",
        },
        variants: {
          base: {
            bg: "black",
            height: "50px",
            color: "white",
            _hover: {
              bg: "black",
              color: "white",
            },
          },
        },
      },
    },
    fonts: {
      body: "Open Sans, sans-serif",
      heading: "Open Sans, sans-serif",
    },
    styles: {
      global: {
        body: {
          bg: "transparent",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider  theme={theme}>
          <App />
      </ChakraProvider>
     </QueryClientProvider>
  );
}

root.render(<MyApp />);
