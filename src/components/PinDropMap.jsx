import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import location from '../assets/location.png'
const customIcon = new L.Icon({
    iconUrl: location,
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
})
function MapEvents({ onMapClick }) {
    useMapEvents({
        click: onMapClick,
    })
    return null
}

export default function PinDropMap() {
    const [pins, setPins] = useState([])
    const [newPin, setNewPin] = useState(null)
    const [remarks, setRemarks] = useState('')
    const mapRef = useRef(null)
    useEffect(() => {
        const savedPins = localStorage.getItem('pins')
        if (savedPins) {
            setPins(JSON.parse(savedPins))
        }
    }, [])
    const updateLocalStorage = (updatedPins) => {
        localStorage.setItem('pins', JSON.stringify(updatedPins))
        setPins(updatedPins)
    }
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng
        setNewPin({
            id: Date.now().toString(),
            lat,
            lng,
            remarks: '',
            address: '',
        })
        setRemarks('')
    }
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
            const data = await response.json()
            return data.display_name || 'Address not found'
        } catch (error) {
            console.error('Error fetching address:', error)
            return 'Address not found'
        }
    }
    const savePin = async () => {
        if (newPin) {
            const address = await fetchAddress(newPin.lat, newPin.lng)
            const pinWithAddress = { ...newPin, remarks, address }
            const updatedPins = [...pins, pinWithAddress]
            updateLocalStorage(updatedPins)
            setNewPin(null)
            setRemarks('')
        }
    }
    const navigateToPin = (pin) => {
        if (mapRef.current) {
            mapRef.current.setView([pin.lat, pin.lng], 13)
        }
    }
    const deletePin = (id) => {
        const updatedPins = pins.filter(pin => pin.id !== id)
        updateLocalStorage(updatedPins)
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-1/3 p-6 bg-white shadow-lg overflow-hidden border-r-2 border-gray-200">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2">Saved Pins</h2>
                <div className="h-[calc(100vh-10rem)] overflow-auto pr-2">
                    {pins.map((pin) => (
                        <div key={pin.id} className="mb-4 p-4 bg-gray-100 rounded-lg shadow border border-gray-200 transition-all hover:shadow-md">
                            <p className="font-medium text-lg text-gray-700">{pin.remarks || 'No remarks'}</p>
                            <p className="text-sm text-gray-500 mt-1">{pin.address}</p>
                            <div className="flex justify-between mt-3">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                                    onClick={() => navigateToPin(pin)}
                                >
                                    View on Map
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                                    onClick={() => deletePin(pin.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 relative">
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    className="z-0"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapEvents onMapClick={handleMapClick} />
                    {pins.map((pin) => (
                        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={customIcon}>
                            <Popup>
                                <div className="bg-white p-3 rounded-md shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
                                    <p className="font-medium text-lg text-gray-700">{pin.remarks || 'No remarks'}</p>
                                    <p className="text-sm text-gray-500 mt-1">{pin.address}</p>
                                    <button
                                        className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 w-full"
                                        onClick={() => deletePin(pin.id)}
                                    >
                                        Delete Pin
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {newPin && (
                        <Marker position={[newPin.lat, newPin.lng]} icon={customIcon}>
                            <Popup>
                                <div className="bg-white p-3 rounded-md shadow-md">
                                    <textarea
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                    <button
                                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 w-full"
                                        onClick={savePin}
                                    >
                                        Save Pin
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>

    )
}