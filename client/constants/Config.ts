import { Platform } from "react-native";

const getBaseUrl = () =>{
    if (Platform.OS === 'android'){
        return 'http://10.0.2.2:3000'
    }
    return 'http://localhost:3000'
}

export const API_BASE_URL = getBaseUrl();

export const CURRENT_DRIVER_ID = '1';

export const PACKAGE_CARD_HEIGHT = 130;