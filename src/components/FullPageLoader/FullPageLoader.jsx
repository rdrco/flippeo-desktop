import {Center, Loader} from "@mantine/core";

export const FullPageLoader = () => {
    return (
        <Center
            pos="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            style={{ zIndex: 9999 }}
        >
            <Loader
                size="xl"
                variant="bars"
            />
        </Center>
    )
}