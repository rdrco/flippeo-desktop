import './App.css'
import {AppMantineProvider} from "./providers/mantine.jsx";
import {useAppLoadingState} from "./stores/app.js";
import {FullPageLoader} from "./components/FullPageLoader/FullPageLoader.jsx";
export const App = () => {
    const isLoading = useAppLoadingState()
    return (
        <AppMantineProvider>
            {isLoading ? <FullPageLoader/> : <div>ici</div>}
        </AppMantineProvider>
    )
}
