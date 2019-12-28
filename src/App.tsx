import React from 'react';
import './App.css';
import { AreaFills, SvgMapView } from './components/svgMap/svgMapView';
import { AreaFill, AreaToken, AreaTransition, MapSnapshot } from './model';
import {
    areaNameToNumber,
    locationToAreaKey,
} from './utils';
import { AreaKey, steppe } from './data/areas';
import connections from './data/connections.json';
import MapView from './components/mapView/mapView';

interface AppState {
    currentLocation: number;
    prevLocation: number;
    steps: number;
    transition?: AreaTransition;
}

class App extends React.Component<{}, AppState> {

    state: AppState = {
        currentLocation: 1,
        prevLocation: 1,
        steps: 200
    };

    render() {
        return <div className="App">
            <div style={ { width: '100vw', height: '100vh' } }>
                <MapView mapSnapshot={ this.getMapSnapshot() } onAreaClick={ this.onAreaClick } />
            </div>
        </div>
        // return (
        //     <div className="App">
        //         <div style={ { width: '100vw', height: '100vh' } }>
        //             <SvgMapView areas={ this.getAreaFills() } onAreaClick={ this.onAreaClick }
        //                      transition={ this.state.transition }/>
        //         </div>
        //     </div>
        // );
    }

    private onAreaClick = (areaKey: AreaKey) => {
        const { currentLocation, prevLocation, steps } = this.state;
        const location = areaNameToNumber(areaKey);
        const isPossible = connections.find(con => con.number === currentLocation)!
            .connections.indexOf(location) >= 0;

        if (
            location === currentLocation
            // || location === prevLocation
            || steps === 0
            || !isPossible
        ) {
            return;
        }

        console.log(this.getLocationInfo(currentLocation).name, '-->', this.getLocationInfo(location).name);
        this.setState({
            currentLocation: location,
            prevLocation: currentLocation,
            steps: steps - 1,
            transition: {
                from: this.getSrcPolygon(currentLocation, location),
                to: areaKey,
                index: Date.now(),
            }
        });
    };

    private getSrcPolygon = (location: number, target: number): AreaKey => {
        if (location === 0) {
            switch (target) {
                case 1:
                case 2:
                    return steppe[0];

                case 3:
                case 4:
                case 5:
                    return steppe[1];

                case 6:
                case 7:
                    return steppe[3];

                default:
                    return steppe[0];
            }
        }
        return locationToAreaKey(location);
    };

    private getMapSnapshot = (): MapSnapshot => {
        return {
            fills: this.getAreaFills(),
            transition: this.state.transition,
            tokens: this.getTokens()
        }
    };

    private getTokens = (): AreaToken[] => {
        if (this.state.prevLocation === this.state.currentLocation) {
            return [];
        }
        const isSteppe = this.state.prevLocation === 0;

        if (isSteppe) {
            return steppe.map(area => ({ areaKey: area, token: 'step' }));
        }
        return [{ areaKey: locationToAreaKey(this.state.prevLocation), token: 'step' }];
    };

    private getAreaFills = (): AreaFills => {
        const { currentLocation, prevLocation } = this.state;
        const ar: Partial<AreaFills> = {};

        const setLocation = (loc: number, fill: AreaFill) => {
            if (loc === 0) {
                for (let st of steppe) {
                    ar[st] = fill;
                }
            } else {
                ar[locationToAreaKey(loc)] = fill;
            }
        };
        const availableLocations = this.getAvailableLocations();

        for (let i = 0; i <= 15; i++) {
            const isAvailable = availableLocations.indexOf(i) >= 0;
            const isPassed = i === prevLocation;
            const isActive = i === currentLocation;

            const fill: AreaFill = isActive
                ? 'active'
                : isPassed ? 'passed'
                    : isAvailable ? 'available'
                        : 'disabled';

            setLocation(i, fill);
        }

        return ar as AreaFills;
    };

    private getAvailableLocations = () => {
        const { currentLocation, prevLocation, steps } = this.state;
        if (steps <= 0) return [];
        return this.getLocationInfo(currentLocation).connections
            .filter(loc => loc !== prevLocation);
    };

    private getLocationInfo = (location: number) => {
        return connections[location]!;
    };
}

export default App;
