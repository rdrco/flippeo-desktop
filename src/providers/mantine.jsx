import { MantineProvider} from "@mantine/core";

export const AppMantineProvider = ({children}) => {

	return (
		<MantineProvider>
			{children}
		</MantineProvider>
	)
}