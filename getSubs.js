// Options
const CLIENT_ID = '837120189518-l4bjs53ahgcvp7a8rr8onvmsphmv9j0u.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;

    getChannel(channel);
    getLatestVideos();
});

// Load auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
    gapi.client
        .init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        })
        .then(() => {
            // Listen for sign in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle initial sign in state
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

// Handle login
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

// Display channel data
function showChannelData(data) {
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

// Get channel from API
function getChannel(channel) {
    gapi.client.youtube.channels
        .list({
            part: 'snippet,contentDetails,statistics',
            forUsername: channel
        })
        .then(response => {
            console.log(response);
            const channel = response.result.items[0];

            const output = `
        <ul class="collection">
          <li class="collection-item">Title: ${channel.snippet.title}</li>
          <li class="collection-item">ID: ${channel.id}</li>
          <li class="collection-item">Subscribers: ${numberWithCommas(
                channel.statistics.subscriberCount
            )}</li>
          <li class="collection-item">Views: ${numberWithCommas(
                channel.statistics.viewCount
            )}</li>
          <li class="collection-item">Videos: ${numberWithCommas(
                channel.statistics.videoCount
            )}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${
                channel.snippet.customUrl
                }">Visit Channel</a>
      `;
            showChannelData(output);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(playlistId);
        })
        .catch(err => alert('No Channel By That Name'));
}

// Add commas to number
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function requestVideoPlaylist(playlistId) {
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    };

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
        const playListItems = response.result.items;
        if (playListItems) {
            let output = '<br><h4 class="center-align">Latest Videos</h4>';

            // Loop through videos and append output
            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
          <div class="col s3">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
            });

            // Output videos
            videoContainer.innerHTML = output;
        } else {
            videoContainer.innerHTML = 'No Uploaded Videos';
        }
    });
}

function getSubscriptions() {
    var nextpgtoken = "";

    var subscriptions_all = [];
    var flag = true;
    console.log("ya em kal");
    while (flag) {
        if (nextpgtoken === "") {
            gapi.client.youtube.subscriptions.list({
                part: "snippet,contentDetails",
                maxResults: 50,
                mine: true
            })
                .then(function(response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log(response);
                        subscriptions_all = subscriptions_all.concat(response.result.items);
                        console.log(response.result.nextPageToken);
                        if(response.result.nextPageToken) {
                            nextpgtoken = response.result.nextPageToken;
                            console.log(nextpgtoken);
                        } else flag = false;
                    },
                    function(err) { console.error("Execute error", err); });

            flag = false;
            /*const subres = gapi.client.youtube.subscriptions.list({"part" : "snippet,contentDetails",
                "mine" : true, "maxResults" : 50});

            subres.execute(response => {
                console.log(response);
                subscriptions_all += response.result.items;
                if(response.result.nextPageToken) {
                    nextpgtoken = response.result.nextPageToken;
                    console.log(nextpgtoken);
                } else flag = false;
            });*/
        }
        else {
            gapi.client.youtube.subscriptions.list({
                part: "snippet,contentDetails",
                maxResults: 50,
                mine: true,
                nextPageToken: nextpgtoken
            })
                .then(function(response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log(response);
                        subscriptions_all = subscriptions_all.concat(response.result.items);
                        console.log(response.result.nextPageToken);
                        if(response.result.nextPageToken) {
                            nextpgtoken = response.result.nextPageToken;
                            console.log(nextpgtoken);
                        } else flag = false;
                    },
                    function(err) { console.error("Execute error", err); });
            /*const subres = gapi.client.youtube.subscriptions.list({"part" : "snippet,contentDetails",
                "mine" : true, "maxResults" : 50, "pageToken" : nextpgtoken});

            subres.execute(response => {
                console.log(response);
                subscriptions_all += response.result.items;
                if(response.result.nextPageToken) {
                    nextpgtoken = response.result.nextPageToken;
                    console.log(nextpgtoken);
                } else flag = false;
            });*/
        }

    }


    return subscriptions_all;
}

function getLatestVideos() {
    var subscriptions = getSubscriptions();

    var videos_all = [];
    console.log(subscriptions.length);
    var date = new Date;
    date.setDate(date.getDate() - 7)

    var j = 0;
    /*
    for (var channel in subscriptions) {
        var i = 0;
        var nextpgtoken = null;
        var videos_latest = gapi.client.youtube.channels.list({
            "id": channel.snippet.resourceId.channelId, //['snippet']['resourceId']['channelId'],
            "part": "contentDetails"
        });

        videos_latest.execute(response => {
        while (true) {

            var subres = youtube.playlistItems.list({"playlistId" : response.result.items[0].contentDetails.relatedPlaylists.uploads,
                "part" : 'snippet', "maxResults" : 50,
                "pageToken" : nextpgtoken});
            subres.execute(response2 => {
            console.log(response2.result.items[0].snippet.publishedAt);
            /*if (datetime.strptime(subres['items'][0]['snippet']['publishedAt'][:
            -5
        ],
            '%Y-%m-%dT%H:%M:%S'
        ) <
            time
        ) :
            break;

            videos_all += subres['items']

            try
        :
            nextpgtoken = subres.get('nextPageToken')
            except :
                break

            if nextpgtoken is
            None :
                break

            i += 1});
            break;
        }});
    }*/


    return videos_all;
}