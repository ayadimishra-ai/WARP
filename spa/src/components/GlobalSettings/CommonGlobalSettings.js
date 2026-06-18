
import { getServiceUrl } from '../../config';
import axios from 'axios';


export async function getGlobalSettingsList() {
    let list = null;
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json'
        },
    };
    await axios.get(getServiceUrl() + 'MasterData/GetGlobalSettingsList', config)
        .then((json) => {
            list = JSON.stringify(json.data)
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    return JSON.parse(list).map(item => ({
        Id: item.globalSettingsGuid,
        Key: item.settingsKey,
        Value: item.settingsValue
    }))
}