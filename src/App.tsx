import React from 'react';
import './App.css';
import { AreasInfo, SvgMapView } from './components/svgMapView';
import { AreaFill, AreaTransition } from './model';
import {
    areaNameToNumber,
    numberToPolygon,
} from './utils';
import { AreaKey, steppe } from './data/areas';
import connections from './data/connections.json';
import { MapView } from './components/mapView/mapView';

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
                <MapView areas={ this.getAreas() } onAreaClick={ this.onAreaClick } transition={ this.state.transition } />
            </div>
        </div>
        // return (
        //     <div className="App">
        //         <div style={ { width: '100vw', height: '100vh' } }>
        //             <SvgMapView areas={ this.getAreas() } onAreaClick={ this.onAreaClick }
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
        return numberToPolygon(location);
    };

    private getAreas = (): AreasInfo => {
        const { currentLocation, prevLocation } = this.state;
        const ar: Partial<AreasInfo> = {};

        const setLocation = (loc: number, fill: AreaFill) => {
            if (loc === 0) {
                for (let st of steppe) {
                    ar[st] = fill;
                }
            } else {
                ar[numberToPolygon(loc)] = fill;
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

        return ar as AreasInfo;
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
