import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

function App() {

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center mb-8">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className="mr-4">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="ml-4">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="ml-4">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEUAAAD///+bm5v6+vpzc3Ofn5+Wlpb09PR8fHz4+PiwsLBvb29NTU3w8PCLi4t6enpCQkJbW1tISEhTU1NlZWU4ODhnZ2cxMTHk5OSEhIQlJSVgYGBEREQ9PT0WFhbU1NSmpqazs7PQ0NAbGxuOjo6avM+PAAADtElEQVR4nO2d3XLiMAyFYwIEmqRsE9iG8rft9v2fcQfaDpGuduyTsdCc774ZnbHiI8sKLQpCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQogJzrkDmJbT+9Be9rmjmJA63PjIHcdkNGXwLbGvwg9vuWOZhOYuMHzmDmYK+vYuMCxyRzMBq3IkMGxyh4NnPtYX1rnDwbMSAoM/R1QCZ7njgSNTNDznjgfOwfsKdmvnAo+VEOgvRX+V3ldQClzmjgdOLTeZOnc8cJRN+EvRFynQX4qqFfRXqimB/g5MJ2n0/lJUVTL+VrDxLrCTpZq/FJUtizDPHQ8cdeD111hTNuEwRb37oHuj76VNrHLHA6eXNuHvNNF5F9h4N/q5fAf9XU5s5S7qr5LZeDd69mQena33Fdx5F3iS50F/pZq6m/BXbHfeBSof9Hc3wQPvo6NW0J/Ru0/RxvsuKobxPKao6sn4W8FGrqC/C1B1N+He6P0NArkfxnM/TrkBCDzvF8sXdGAoOkCKzm5/enlFxwYBMYz39P3HAzo4BCeAwKVll9lJgVEpOtqJL+j4klFtwyiBy9EDzKWpavxG5djT+AnW1hAxjCcEWqsVlA9GnSakwBYdYhrqHYw6D/4Rj6i26BiTQDSd5AoGW0UNYhhPCbRlhohhPJWiB3SMSSBaFmqj8idQHrnWtlJUTVlEBSdTdNihY0wC0fhVPmjr2IS3CWMC1QpG3fBKgWtb3+MjejLKB23toh3wRP9F+RsdYxKIYTy1gh06xiQQn7g+S4G2VhDxaY+sZEpjpwkpMGracCEeYcwmlA9GzYvKd7CyZROIYTwpcLAlEDFOqXZRWyla4wXa2kWPMjhAqdae0DEmgRjGM92TOQIESpsobR14ET0ZafTrBh1jEgdp9FHfD8pSrTVWycj3J6qSeaQDL8Do27/oGJNgT+Y/UC0LW+8gPkVLW7tojzd6Wz6IGMaTjd/WViXTA4xepbmtWrQBfOKqLl9snSZqwDilupuwZRPq4yzALmqsZVG8p6eoMnpjAothHF3UDIhM0dJWihbFeWwUiJaFrUrmygUr0NYueuNuZFEpqko1W3cT33ykrOBSCLS4glduEquoUk39ELKt+8ERb5+LuF96kCtozibSMX3gRTATAo2VagjO8h20NScDYS8U2jrwYhj3to0N44EYb6QuBRa97xS98lPRVrZ6MkBevw5exu4msNSXwfX/OCKEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCiAP+ATvIH0Tc4tsSAAAAAElFTkSuQmCC" className="logo" alt="Shadcn UI logo" />
        </a>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vite + React + Shadcn UI</CardTitle>
          <CardDescription>A template project ready for development.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can easily add more Shadcn UI components using the CLI.
            </AlertDescription>
          </Alert>

          <p className="mb-4">
            This project demonstrates the integration of Vite, React, and Shadcn UI.
          </p>
          <div className="flex justify-center mb-4">
            <Button onClick={() => alert('Shadcn UI Button Clicked!')}>
              Example Shadcn Button
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Edit <code>src/App.tsx</code> and save to test HMR.
          </p>
        </CardContent>
      </Card>

      <p className="read-the-docs mt-8">
        Click on the Vite and React logos to learn more. Visit the <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">Shadcn UI docs</a>.
      </p>
    </div>
  )
}

export default App
