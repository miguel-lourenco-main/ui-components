"use client"

import { useState, useEffect } from 'react'

interface GeolocationState {
  /**
   * The latitude of the user's location, or null if not available.
   */
  latitude: number | null;
  /**
   * The longitude of the user's location, or null if not available.
   */
  longitude: number | null;
  /**
   * The accuracy of the geolocation position in meters, or null if not available.
   */
  accuracy: number | null;
  /**
   * Any error that occurred while trying to retrieve the position, or null if no error.
   */
  error: GeolocationPositionError | null;
  /**
   * A boolean indicating if the geolocation data is currently being loaded.
   */
  loading: boolean;
}

/**
 * A React hook that returns the current geolocation state, watching for updates.
 *
 * @param {PositionOptions} [options] - Options for the geolocation retrieval.
 * @returns {GeolocationState} The current geolocation state, including latitude, longitude, accuracy, error, and loading status.
 */
export function useGeolocation(options?: PositionOptions): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new GeolocationPositionError(),
        loading: false,
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false,
        }));
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
}

/**
 * A React hook that retrieves the geolocation once and returns the state.
 *
 * @param {PositionOptions} [options] - Options for the geolocation retrieval.
 * @returns {GeolocationState} The current geolocation state, including latitude, longitude, accuracy, error, and loading status.
 */
export function useGeolocationOnce(options?: PositionOptions): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new GeolocationPositionError(),
        loading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false,
        }));
      },
      options
    );
  }, [options]);

  return state;
}