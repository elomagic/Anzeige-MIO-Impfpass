export const initialConfig: {
    XML_DATA: string[]
} = {
    XML_DATA: [],
}

export async function loadConfig() {

    let dataUrl = new URLSearchParams(window.location.search).get("datasetUrl")
    dataUrl = dataUrl ? dataUrl : 'config.json';

    let config = initialConfig
    try {
        // TODO Authentication missing. Bearer Token from OAuth2 is preferred
        config = await (await fetch(dataUrl)).json()
    } catch (e) {
        console.log(e)
    }
    return config
}
