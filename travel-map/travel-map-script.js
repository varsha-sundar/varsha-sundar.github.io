const TravelMap = {
    // Constants
    API_KEY: '5b3ce3597851110001cf6248f2cd33880b1940c2853bd933973f70de',

    // Properties
    map: null,
    pathLayer: null,
    markerLayer: null,
    currentSegment: 0,
    visibleLocationIndices: [],
    animationInProgress: false,
    animationStopped: false,

// Travel path data
travelPath: [
    { name: "Singapore", state: "", country: "Singapore", lat: 1.3521, lon: 103.8198, date: "2024-03-26", type: "start", tripGroup: "start", description: "Probably can fit 200 characters here without this getting too long. Figure out scrolling/pause/play." },
    { name: "Denpasar", state: "Bali", country: "Indonesia", lat: -8.6500, lon: 115.2167, date: "2024-03-26", type: "fly", tripGroup: "indonesiaAdventure", description: "NA", hidden: true},
    { name: "Ubud", state: "Bali", country: "Indonesia", lat: -8.4095, lon: 115.1889, date: "2024-03-26", type: "drive", tripGroup: "indonesiaAdventure", description: "tbd -- arrived in Ubud, staying with Shrey etc.." },
    { name: "Canggu", state: "Bali", country: "Indonesia", lat: -8.6553, lon: 115.1280, date: "2024-03-29", type: "drive", tripGroup: "indonesiaAdventure", description: "Sumukhi 30th -- see how much text can fit here without it getting too long"},
    { name: "Denpasar", state: "Bali", country: "Indonesia", lat: -8.6500, lon: 115.2167, date: "2024-04-01", type: "drive", tripGroup: "indonesiaAdventure", hidden: true },
    { name: "Kupang", state: "NTT", country: "Indonesia", lat: -10.1616, lon: 123.5952, date: "2024-04-01", type: "fly", tripGroup: "indonesiaAdventure", description: "Stopover en route to Alor" },
    { name: "Alor", state: "NTT", country: "Indonesia", lat: -8.1751, lon: 124.5847, date: "2024-04-02", type: "fly", tripGroup: "indonesiaAdventure", description: "Dive trip #1."},
    { name: "Kupang", state: "NTT", country: "Indonesia", lat: -10.1616, lon: 123.5952, date: "2024-04-07", type: "fly", tripGroup: "indonesiaAdventure", hidden: true },
    { name: "Denpasar", state: "Bali", country: "Indonesia", lat: -8.6500, lon: 115.2167, date: "2024-04-07", type: "fly", tripGroup: "indonesiaAdventure", hidden: true},
    { name: "Ubud", state: "Bali", country: "Indonesia", lat: -8.4095, lon: 115.1889, date: "2024-04-07", type: "drive", tripGroup: "indonesiaAdventure" },
    { name: "Tulamben", state: "Bali", country: "Indonesia", lat: -8.2740, lon: 115.5944, date: "2024-04-11", type: "drive", tripGroup: "indonesiaAdventure" },
    { name: "Ubud", state: "Bali", country: "Indonesia", lat: -8.4095, lon: 115.1889, date: "2024-04-15", type: "drive", tripGroup: "indonesiaAdventure"},
    { name: "Denpasar", state: "Bali", country: "Indonesia", lat: -8.6500, lon: 115.2167, date: "2024-04-18", type: "fly", tripGroup: "indonesiaAdventure", hidden: true},
    { name: "Singapore", state: "", country: "Singapore", lat: 1.3521, lon: 103.8198, date: "2024-04-19", type: "fly", tripGroup: "singaporeStopover"},
    { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, date: "2024-05-03", type: "fly", tripGroup: "indianSojourn", description: "tbd"},
    { name: "Bangalore", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946, date: "2024-05-17", type: "train", tripGroup: "indianSojourn", description: "tbd" },
    { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, date: "2024-05-24", type: "fly", tripGroup: "indianSojourn"},
    { name: "Guwahati", state: "Assam", country: "India", lat: 26.1445, lon: 91.7362, date: "2024-05-29", type: "fly", tripGroup: "indianSojourn", hidden: true },
    { name: "Shillong", state: "Meghalaya", country: "India", lat: 25.5788, lon: 91.8933, date: "2024-05-29", type: "fly", tripGroup: "indianSojourn", description: "" },
    { name: "Guwahati", state: "Assam", country: "India", lat: 26.1445, lon: 91.7362, date: "2024-06-04", type: "fly", tripGroup: "indianSojourn", hidden: true },
    { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, date: "2024-06-04", type: "fly", tripGroup: "indianSojourn"},
    { name: "Delhi", state: "", country: "India", lat: 28.6139, lon: 77.2090, date: "2024-06-08", type: "fly", tripGroup: "indianSojourn"},
    { name: "London", state: "England", country: "United Kingdom", lat: 51.5074, lon: -0.1278, date: "2024-06-08", type: "fly", tripGroup: "londonCityBreak"},
    { name: "Wirral Peninsula", state: "Merseyside", country: "England", lat: 53.3727, lon: -3.0738, date: "2024-06-15", type: "drive", tripGroup: "englishCountrysideTour" },
    { name: "Oxford", state: "Oxfordshire", country: "England", lat: 51.7520, lon: -1.2577, date: "2024-06-16", type: "drive", tripGroup: "englishCountrysideTour", hidden: true},
    { name: "Dover", state: "Kent", country: "England", lat: 51.1279, lon: 1.3134, date: "2024-06-16", type: "drive", tripGroup: "englishCountrysideTour"},
    { name: "Cambridge", state: "Cambridgeshire", country: "England", lat: 52.2053, lon: 0.1218, date: "2024-06-18", type: "drive", tripGroup: "englishCountrysideTour"},
    { name: "London", state: "England", country: "United Kingdom", lat: 51.5074, lon: -0.1278, date: "2024-06-21", type: "train", tripGroup: "londonCityBreak"},
    { name: "New York City", state: "New York", country: "USA", lat: 40.7128, lon: -74.0060, date: "2024-06-30", type: "fly", tripGroup: "bigAppleExperience" },
    { name: "Kalispell", state: "Montana", country: "USA", lat: 48.1919, lon: -114.3168, date: "2024-07-09", type: "fly", tripGroup: "mountainWestAdventure" },
    { name: "East Portal", state: "Montana", country: "USA", lat: 47.3972, lon: -115.6352, date: "2024-07-09", type: "drive", tripGroup: "mountainWestAdventure" },
    { name: "Sandpoint", state: "Idaho", country: "USA", lat: 48.2766, lon: -116.5535, date: "2024-07-10", type: "drive", tripGroup: "mountainWestAdventure" },
    { name: "Glacier National Park", state: "Montana", country: "USA", lat: 48.4106, lon: -114.3353, date: "2024-07-11", type: "drive", tripGroup: "mountainWestAdventure" },
    { name: "Mount Rushmore", state: "South Dakota", country: "USA", lat: 43.8791, lon: -103.4591, date: "2024-07-13", type: "drive", tripGroup: "mountainWestAdventure" },
    { name: "Sioux Falls", state: "South Dakota", country: "USA", lat: 43.5460, lon: -96.7313, date: "2024-07-14", type: "drive", tripGroup: "mountainWestAdventure" },
    { name: "Chicago", state: "Illinois", country: "USA", lat: 41.8781, lon: -87.6298, date: "2024-07-15", type: "drive", tripGroup: "windyCityVisit" },
    { name: "Minneapolis", state: "Minnesota", country: "USA", lat: 44.9778, lon: -93.2650, date: "2024-07-18", type: "fly", tripGroup: "twinCitiesStopover"},
    { name: "Chicago", state: "Illinois", country: "USA", lat: 41.8781, lon: -87.6298, date: "2024-07-22", type: "fly", tripGroup: "windyCityVisit" },
    { name: "Denver", state: "Colorado", country: "USA", lat: 39.7392, lon: -104.9903, date: "2024-07-28", type: "fly", tripGroup: "southwestNationalParks" },
    { name: "Arches National Park", state: "Utah", country: "USA", lat: 38.5733, lon: -109.5498, date: "2024-07-29", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Bryce Canyon National Park", state: "Utah", country: "USA", lat: 37.6283, lon: -112.1676, date: "2024-07-30", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Zion National Park", state: "Utah", country: "USA", lat: 37.1886, lon: -113.0003, date: "2024-07-31", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Las Vegas", state: "Nevada", country: "USA", lat: 36.1699, lon: -115.1398, date: "2024-08-02", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Mammoth Lakes", state: "California", country: "USA", lat: 37.6485, lon: -118.9721, date: "2024-08-02", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Yosemite National Park", state: "California", country: "USA", lat: 37.6746, lon: -119.7870, date: "2024-08-04", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "San Francisco", state: "California", country: "USA", lat: 37.7749, lon: -122.4194, date: "2024-08-04", type: "drive", tripGroup: "southwestNationalParks" },
    { name: "Atlanta", state: "Georgia", country: "USA", lat: 33.7490, lon: -84.3880, date: "2024-08-19", type: "fly", tripGroup: "southernCharm"},
    { name: "Nashville", state: "Tennessee", country: "USA", lat: 36.1627, lon: -86.7816, date: "2024-08-22", type: "drive", tripGroup: "southernCharm"},
    { name: "New York City", state: "New York", country: "USA", lat: 40.7128, lon: -74.0060, date: "2024-08-27", type: "fly", tripGroup: "bigAppleExperience"},
    { name: "Woodstock", state: "Vermont", country: "USA", lat: 43.6231, lon: -72.5195, date: "2024-08-31", type: "drive", tripGroup: "newEnglandEscape" },
    { name: "New York City", state: "New York", country: "USA", lat: 40.7128, lon: -74.0060, date: "2024-09-02", type: "drive", tripGroup: "bigAppleExperience"},
    { name: "Istanbul", state: "", country: "Turkey", lat: 41.0082, lon: 28.9784, date: "2024-09-10", type: "fly", tripGroup: "balkanDiscovery" },
    { name: "Ljubljana", state: "", country: "Slovenia", lat: 46.0569, lon: 14.5058, date: "2024-09-14", type: "fly", tripGroup: "balkanDiscovery" },
    { name: "Bled", state: "", country: "Slovenia", lat: 46.3683, lon: 14.1146, date: "2024-09-14", type: "drive", tripGroup: "balkanDiscovery"},
    { name: "Opatija", state: "", country: "Croatia", lat: 45.3376, lon: 14.3054, date: "2024-09-14", type: "drive", tripGroup: "balkanDiscovery"},
    { name: "Pula", state: "", country: "Croatia", lat: 44.8666, lon: 13.8496, date: "2024-09-15", type: "drive", tripGroup: "balkanDiscovery"},
    { name: "Rovinj", state: "", country: "Croatia", lat: 45.0812, lon: 13.6387, date: "2024-09-15", type: "drive", tripGroup: "balkanDiscovery" },
    { name: "Motovun", state: "", country: "Croatia", lat: 45.3369, lon: 13.8283, date: "2024-09-16", type: "drive", tripGroup: "balkanDiscovery"},
    { name: "Branik", state: "", country: "Slovenia", lat: 45.8281, lon: 13.7844, date: "2024-09-16", type: "drive", tripGroup: "balkanDiscovery"},
    { name: "Conegliano", state: "Veneto", country: "Italy", lat: 45.8895, lon: 12.3008, date: "2024-09-17", type: "drive", tripGroup: "dolomitesExpedition" },
    { name: "Val Gardena", state: "South Tyrol", country: "Italy", lat: 46.5590, lon: 11.6760, date: "2024-09-17", type: "drive", tripGroup: "dolomitesExpedition" },
    { name: "Sexten", state: "South Tyrol", country: "Italy", lat: 46.7016, lon: 12.3498, date: "2024-09-19", type: "drive", tripGroup: "dolomitesExpedition" },
    { name: "Tre Cime National Park", state: "South Tyrol", country: "Italy", lat: 46.6167, lon: 12.3000, date: "2024-09-20", type: "hike", tripGroup: "dolomitesExpedition" },
    { name: "Moos", state: "South Tyrol", country: "Italy", lat: 46.7143, lon: 12.3750, date: "2024-09-22", type: "hike", tripGroup: "dolomitesExpedition" },
    { name: "Venice", state: "Veneto", country: "Italy", lat: 45.4408, lon: 12.3155, date: "2024-09-23", type: "drive", tripGroup: "italianCitiesTour" },
    { name: "Venezia Santa Lucia", lat: 45.4410, lon: 12.3210, date: "2024-09-23", type: "train", hidden: true },
    { name: "Venezia Mestre", lat: 45.4827, lon: 12.2358, date: "2024-09-23", type: "train", hidden: true },
    { name: "Padova", lat: 45.4064, lon: 11.8768, date: "2024-09-23", type: "train", hidden: true },
    { name: "Bologna", lat: 44.5075, lon: 11.3514, date: "2024-09-23", type: "train", hidden: true },
    { name: "Florence", state: "Tuscany", country: "Italy", lat: 43.7696, lon: 11.2558, date: "2024-09-23", type: "train", tripGroup: "italianCitiesTour" },
    { name: "Bologna Centrale", lat: 44.5075, lon: 11.3426, date: "2024-09-27", type: "train", hidden: true },
    { name: "Milan", state: "Lombardy", country: "Italy", lat: 45.4642, lon: 9.1900, date: "2024-09-27", type: "train", tripGroup: "italianCitiesTour" },
    { name: "Delhi", state: "", country: "India", lat: 28.6139, lon: 77.2090, date: "2024-09-29", type: "fly", tripGroup: "indianSojourn"}
],

    // Trip colors
    tripColors: {
        start: '#f0f0f0',
        singaporeStopover: '#ffab40',
        indonesiaAdventure: '#ffd180',
        londonCityBreak: '#ff8a65',
        englishCountrysideTour: '#ffab91',
        bigAppleExperience: '#81d4fa',
        mountainWestAdventure: '#a5d6a7',
        southwestNationalParks: '#c5e1a5',
        southernCharm: '#80deea',
        balkanDiscovery: '#fff59d',
        dolomitesExpedition: '#ffcc80',
        italianCitiesTour: '#ef9a9a',
        indianSojourn: '#ce93d8',
        windyCityVisit: '#90caf9',
        twinCitiesStopover: '#b39ddb',
        newEnglandEscape: '#ffcc80'
    },

    initMap() {
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            zoomSnap: 0.1,
            zoomDelta: 0.5,
            wheelDebounceTime: 40,
            wheelPxPerZoomLevel: 80
        });
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    
        this.pathLayer = L.layerGroup().addTo(this.map);
        this.markerLayer = L.layerGroup().addTo(this.map);
        this.addMarker(this.travelPath[0], "🏠");
        this.createTimeline();
    
        // Enable smooth wheel zoom
        this.map.on('zoomstart', () => this.map.smoothZoom = true);
        this.map.on('zoomend', () => this.map.smoothZoom = false);
    
        this.map._wheelZoom = (e) => {
            if (this.map.smoothZoom) {
                const delta = L.DomEvent.getWheelDelta(e);
                const zoom = this.map.getZoom();
                const newZoom = zoom + delta * 0.1;
                this.map.setZoom(newZoom, { animate: true, duration: 0.25 });
            } else {
                L.Map.prototype._wheelZoom.call(this.map, e);
            }
        };
    },

    async fetchRoute(start, end, type) {
        const profile = type === 'train' ? 'driving-car' : 'driving-car';
        const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${this.API_KEY}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } catch (error) {
            console.error('Error fetching route:', error);
            return [[start.lat, start.lon], [end.lat, end.lon]];
        }
    },

    addMarker(location, icon) {
        if (!location.hidden) {
            const marker = L.marker([location.lat, location.lon])
                .bindPopup(`${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}<br>${this.formatDate(location.date)}`)
                .addTo(this.markerLayer);

            if (icon) {
                L.marker([location.lat, location.lon], {
                    icon: L.divIcon({
                        html: icon,
                        className: 'travel-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(this.markerLayer);
            }
        }
    },

    async animateSegment() {
        if (this.currentSegment >= this.travelPath.length - 1) return;
    
        const start = this.travelPath[this.currentSegment];
        const end = this.travelPath[this.currentSegment + 1];
    
        // Highlight the next destination at the beginning of the animation
        if (!end.hidden) {
            const nextVisibleIndex = this.visibleLocationIndices.indexOf(this.currentSegment + 1);
            if (nextVisibleIndex !== -1) {
                this.highlightTimelineItem(nextVisibleIndex);
            }
        }
    
        let route;
        if (end.type === 'fly') {
            route = this.createArc([start.lat, start.lon], [end.lat, end.lon], 100);
        } else if (end.type === 'drive' || end.type === 'train') {
            route = await this.fetchRoute(start, end, end.type);
        } else {
            route = [[start.lat, start.lon], [end.lat, end.lon]];
        }
    
        const color = this.getColor(end.type);
        const dashArray = end.type === "fly" ? '10, 10' : null;
    
        const line = L.polyline([], {
            color: color,
            dashArray: dashArray
        }).addTo(this.pathLayer);
    
        let icon_marker;
        if (!end.hidden) {
            const icon = this.getIcon(end.type);
            icon_marker = L.marker([start.lat, start.lon], {
                icon: L.divIcon({
                    html: icon,
                    className: 'travel-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.markerLayer);
        }
    
        const bounds = L.latLngBounds(route);
        this.map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1 });
    
        const animationDuration = 3000;
        const startTime = Date.now();
    
        return new Promise((resolve) => {
            const animate = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / animationDuration, 1);
    
                const currentIndex = Math.floor(progress * (route.length - 1));
                const currentPoint = route[currentIndex];
    
                if (icon_marker) {
                    icon_marker.setLatLng(currentPoint);
                }
                
                line.setLatLngs(route.slice(0, currentIndex + 1));
    
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (!end.hidden) {
                        this.addMarker(end);
                    }
                    this.currentSegment++;
                    resolve();
                }
            };
    
            setTimeout(animate, 1000);
        });
    },

    createArc(start, end, numPoints = 100) {
        const latlngs = [];
        const R = 6371; // Earth's radius in km

        // Convert lat/lon to radians
        const lat1 = start[0] * Math.PI / 180;
        const lon1 = start[1] * Math.PI / 180;
        const lat2 = end[0] * Math.PI / 180;
        const lon2 = end[1] * Math.PI / 180;

        // Calculate the great circle distance
        const d = 2 * R * Math.asin(Math.sqrt(
            Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
        ));

        for (let i = 0; i <= numPoints; i++) {
            const f = i / numPoints;
            
            // Exaggerate the curvature
            const exaggeration = 0.15; // Adjust this value to increase/decrease curvature
            const altitude = Math.sin(Math.PI * f) * exaggeration * d / 2;

            const A = Math.sin((1 - f) * d / R) / Math.sin(d / R);
            const B = Math.sin(f * d / R) / Math.sin(d / R);

            const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
            const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
            const z = A * Math.sin(lat1) + B * Math.sin(lat2);

            const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
            const lon = Math.atan2(y, x);

            latlngs.push([
                (lat * 180 / Math.PI) + (altitude / R) * (180 / Math.PI),
                lon * 180 / Math.PI
            ]);
        }

        return latlngs;
    },

    async startAnimation() {
        this.resetAnimation();
        this.animationInProgress = true;
        this.animationStopped = false;
        for (let i = 0; i < this.travelPath.length - 1; i++) {
            if (this.animationStopped) break;
            await this.animateSegment();
            if (this.animationStopped) break;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        this.showFullView();
        this.animationInProgress = false;
    },

    stopAnimation() {
        this.animationStopped = true;
    },


    showFullView() {
        const bounds = L.latLngBounds(this.travelPath.map(loc => [loc.lat, loc.lon]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
    },

    showAllRoutes() {
        this.resetAnimation();
        this.travelPath.forEach((location, index) => {
            if (index < this.travelPath.length - 1) {
                const start = location;
                const end = this.travelPath[index + 1];
                const color = this.getColor(end.type);
                const dashArray = end.type === "fly" ? '10, 10' : null;

                if (end.type === 'fly') {
                    const route = this.createArc([start.lat, start.lon], [end.lat, end.lon], 100);
                    L.polyline(route, { color, dashArray }).addTo(this.pathLayer);
                } else {
                    L.polyline([[start.lat, start.lon], [end.lat, end.lon]], { color, dashArray }).addTo(this.pathLayer);
                }
            }
            this.addMarker(location);
        });
        this.showFullView();
    },

    resetAnimation() {
        this.currentSegment = 0;
        this.pathLayer.clearLayers();
        this.markerLayer.clearLayers();
        this.addMarker(this.travelPath[0], "🏠");
        this.map.setView([20, 0], 2);
        this.clearTimelineHighlights();
    },

    createTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = ''; // Clear existing content
        this.visibleLocationIndices = [];
        let previousVisibleLocation = null;

        this.travelPath.forEach((location, index) => {
            if (!location.hidden) {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                // Set background color with reduced opacity
                const bgColor = this.tripColors[location.tripGroup] || '#ffffff';
                item.style.backgroundColor = this.hexToRGBA(bgColor, 0.3);
                
                // Calculate distance from previous visible location
                let distance = '';
                if (previousVisibleLocation) {
                    distance = this.calculateDistance(previousVisibleLocation, location);
                }
                
                item.innerHTML = `
                    <div class="timeline-location">
                        <span class="timeline-icon">${this.getIcon(location.type)}</span>${location.name}, ${location.country}
                    </div>
                    <div class="timeline-date">${this.formatDate(location.date)}</div>
                    <div class="timeline-description">${location.description || ''}</div>
                    ${distance ? `<div class="timeline-distance">${distance} km</div>` : ''}
                `;
                item.onclick = () => this.jumpToLocation(index);
                timeline.appendChild(item);

                this.visibleLocationIndices.push(index);
                previousVisibleLocation = location;
            }
        });
    },
    
    jumpToLocation(index) {
        const location = this.travelPath[index];
        this.map.flyTo([location.lat, location.lon], 8, {
            animate: true,
            duration: 2
        });
        
        setTimeout(() => {
            L.popup()
                .setLatLng([location.lat, location.lon])
                .setContent(`${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}<br>${this.formatDate(location.date)}`)
                .openOn(this.map);
        }, 2000);
        
        const visibleIndex = this.visibleLocationIndices.indexOf(index);
        if (visibleIndex !== -1) {
            this.highlightTimelineItem(visibleIndex);
        }
    },
    
    highlightTimelineItem(visibleIndex) {
        this.clearTimelineHighlights();
        const timeline = document.getElementById('timeline');
        const timelineItems = timeline.querySelectorAll('.timeline-item');
        const activeItem = timelineItems[visibleIndex];
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Center the active item in the timeline
            const itemHeight = activeItem.offsetHeight;
            const timelineHeight = timeline.offsetHeight;
            const scrollTop = activeItem.offsetTop - (timelineHeight / 2) + (itemHeight / 2);
            
            timeline.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    },

    clearTimelineHighlights() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.originalColor) {
                item.style.backgroundColor = item.dataset.originalColor;
                delete item.dataset.originalColor;
            }
        });
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    getIcon(type) {
        switch(type) {
            case "fly": return "✈️";
            case "drive": return "🚗";
            case "train": return "🚂";
            case "hike": return "🥾";
            default: return "📍";
        }
    },

    getColor(type) {
        switch(type) {
            case "fly": return 'blue';
            case "drive": return 'red';
            case "train": return 'green';
            case "hike": return 'orange';
            default: return 'purple';
        }
    },

    hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    calculateDistance(location1, location2) {
        const R = 6371; // Earth's radius in km
        const dLat = (location2.lat - location1.lat) * Math.PI / 180;
        const dLon = (location2.lon - location1.lon) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(location1.lat * Math.PI / 180) * Math.cos(location2.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return Math.round(distance);
    }

};

// Initialize map when the script loads
document.addEventListener('DOMContentLoaded', () => {
    TravelMap.initMap();
});

// Expose necessary functions globally
window.startAnimation = () => {
    if (!TravelMap.animationInProgress) {
        TravelMap.startAnimation();
    }
};
window.stopAnimation = () => TravelMap.stopAnimation();
window.resetAnimation = () => TravelMap.resetAnimation();
window.showAllRoutes = () => TravelMap.showAllRoutes();
