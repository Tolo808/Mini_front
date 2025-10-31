import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default function MapPicker({ pickup, setPickup, dropoff, setDropoff }) {
  function ClickHandler() {
    useMapEvents({
      click(e) {
        if (!pickup) setPickup({ lat: e.latlng.lat, lng: e.latlng.lng })
        else if (!dropoff) setDropoff({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    })
    return null
  }

  return (
    <MapContainer center={[9.02, 38.74]} zoom={13} style={{ height: 380, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler />
      {pickup && <Marker position={[pickup.lat, pickup.lng]}><Popup>Pickup</Popup></Marker>}
      {dropoff && <Marker position={[dropoff.lat, dropoff.lng]}><Popup>Dropoff</Popup></Marker>}
    </MapContainer>
  )
}
