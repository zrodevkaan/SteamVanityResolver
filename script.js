const submitBtn = document.getElementById('submit-btn');
const vanityUrlInput = document.getElementById('vanity-url');
const steamIdResult = document.getElementById('steam-id');
const steamIdResult1 = document.getElementById('steam-id1');
const steamIdResult2 = document.getElementById('steam-id2');
const steamIdResult3 = document.getElementById('steam-id3');
const userInfoResult = document.getElementById('user-info');

let apiKey = null;

const fetchData = (url) => fetch(url).then(response => response.json());
const displayResult = (element, content) => {
    element.textContent = content;
    element.style.display = 'block';
};
const displayError = (element, message) => {
    displayResult(element, message);
    // steamIdResult1.style.display = 'none';
    steamIdResult2.style.display = 'none';
    steamIdResult3.style.display = 'none';
};
const resolveVanityUrl = (vanityUrl) => {
    const encodedVanityUrl = encodeURIComponent(vanityUrl);
    const url = `https://corsproxy.io/?https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodedVanityUrl}`;
    return fetchData(url);
};
const fetchUserInfo = (steamId) => {
    const url = `https://corsproxy.io/?https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
    return fetchData(url);
};

const findProfileStatus = (int) => {
    switch (int) {
        case 1:
            return "Private";
        case 2:
            return "Public";
        default:
            return "Couldn't figure it out lol";
    }
};

submitBtn.addEventListener('click', () => {
    const input = vanityUrlInput.value.trim();
    apiKey = Object.entries(document.getElementsByClassName("apikey")).find(x => x)[1].value // Do not question it.
    // Check if input is a Steam ID (numeric)
    if (!isNaN(input)) {
        fetchUserInfo(input)
            .then(data => {
                if (data.response.players.length > 0) {
                    const user = data.response.players[0];
                    displayResult(steamIdResult1, "Username: " + user.personaname + " || \nProfile Status: " + findProfileStatus(user.profilestate) + "");
                    // displayResult(steamIdResult1, `Username: ${user.personaname}`);
                    steamIdResult2.innerHTML = `
                        <a href="${user.profileurl}" target="_blank">
                            <img src="${user.avatarfull}" alt="Avatar">
                        </a>`;
                    steamIdResult2.style.display = 'block';
                    //steamIdResult3.textContent = `Profile Status: ${findProfileStatus(user.profilestate)}`;
                    //steamIdResult3.style.display = 'block';
                } else {
                    displayError(userInfoResult, 'User information not found.');
                }
            })
            .catch(error => {
                displayError(userInfoResult, 'An error occurred while retrieving user information.');
            });
    } else {
        // Input is not a Steam ID, assume it's a vanity URL
        resolveVanityUrl(input)
            .then(data => {
                if (data.response.success === 1) {
                    const steamId = data.response.steamid;
                    displayResult(steamIdResult, `Steam ID: ${steamId}`);
                    fetchUserInfo(steamId)
                        .then(data => {
                            const players = data.response.players;
                            if (players.length > 0) {
                                const user = players[0];
                                displayResult(steamIdResult1, "Username: " + user.personaname + " || \nProfile Status: " + findProfileStatus(user.profilestate) + "");
                                steamIdResult2.innerHTML = `
                                    <a href="${user.profileurl}" target="_blank">
                                        <img src="${user.avatarfull}" alt="Avatar">
                                    </a>`;
                                steamIdResult2.style.display = 'block';
                            } else {
                                displayError(userInfoResult, 'User information not found.');
                            }
                        })
                        .catch(error => {
                            displayError(userInfoResult, 'An error occurred while retrieving user information.');
                        });
                } else {
                    displayError(steamIdResult, 'Failed to resolve vanity URL.');
                }
            })
            .catch(error => {
                displayError(steamIdResult, 'An error occurred during the request.');
            });
    }
});
