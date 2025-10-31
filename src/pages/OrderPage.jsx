import React, { useState } from 'react'
import MapPicker from '../components/MapPicker.jsx'
import { getPrice, createOrder } from '../api'
import { useNavigate } from 'react-router-dom'
import '../styles/OrderPage.css'

export default function OrderPage() {
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [pickupText, setPickupText] = useState('')
  const [dropoffText, setDropoffText] = useState('')
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [payment, setPayment] = useState('Cash')
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function handleGetPrice() {
    if ((!pickup && !pickupText) || (!dropoff && !dropoffText))
      return alert('Select or enter pickup and dropoff')
    setLoading(true)
    try {
      const res = await getPrice(
        pickup || { lat: 0, lng: 0 }, // fallback coordinates if manually entered
        dropoff || { lat: 0, lng: 0 }
      )
      setPrice(res.data.price)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to get price')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    const token = localStorage.getItem('token')
    if (!token) return nav('/')
    setLoading(true)
    try {
      const payload = {
        pickup: pickup || pickupText,
        dropoff: dropoff || dropoffText,
        item,
        quantity,
        payment,
        price
      }
      await createOrder(token, payload)
      alert('Order placed!')
      nav('/')
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="order-container">
      <div className="order-card">
        <h3>Order Details</h3>
        <p>Select pickup/dropoff on map or enter manually.</p>

        <div className="map-wrapper">
          <MapPicker
            pickup={pickup}
            setPickup={setPickup}
            dropoff={dropoff}
            setDropoff={setDropoff}
          />
        </div>

        <input
          placeholder="Pickup location"
          value={pickupText}
          onChange={e => setPickupText(e.target.value)}
        />
        <input
          placeholder="Dropoff location"
          value={dropoffText}
          onChange={e => setDropoffText(e.target.value)}
        />
        <input
          placeholder="Item description"
          value={item}
          onChange={e => setItem(e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
        />
        <select value={payment} onChange={e => setPayment(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Mobile Money">Mobile Money</option>
          <option value="Card">Card</option>
        </select>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-blue" onClick={handleGetPrice} disabled={loading}>
            Calculate Price
          </button>
          {price !== null && <div className="price-display">Price: {price} ETB</div>}
        </div>
        {price !== null && (
          <button className="btn btn-green" onClick={handleConfirm} disabled={loading}>
            {loading ? '...' : 'Confirm Order'}
          </button>
        )}
      </div>
    </div>
  )
}
