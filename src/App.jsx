import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentCat, setCurrentCat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [banList, setBanList] = useState([])
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const addToBanList = (attribute) => {
    if (!banList.includes(attribute)) {
      setBanList([...banList, attribute])
    }
  }

  const removeFromBanList = (attribute) => {
    setBanList(banList.filter(item => item !== attribute))
  }

  const goBackToCat = (historyCat) => {
    setCurrentCat(historyCat)
    // Don't modify history when going back - just set the current cat
  }

  const fetchCatData = async () => {
    setLoading(true)
    setError(null)

    const API_KEY = import.meta.env.VITE_CAT_API_KEY

    if (!API_KEY) {
      setError('API key not found. Please check your environment configuration.')
      setLoading(false)
      return
    }

    try {
      let attempts = 0
      let validCat = null

      while (attempts < 10 && !validCat) {
        try {
          const response = await fetch(`https://api.thecatapi.com/v1/images/search?has_breeds=1&limit=1&size=med&api_key=${API_KEY}`)
          const data = await response.json()

          if (data && data.length > 0 && data[0].breeds && data[0].breeds.length > 0) {
            const cat = data[0]
            const breed = cat.breeds[0]

            const catData = {
              id: cat.id,
              image: cat.url,
              breed: breed.name,
              origin: breed.origin || 'Unknown',
              temperament: breed.temperament ? breed.temperament.split(',')[0].trim() : 'Friendly',
              description: breed.description || 'A wonderful and lovable cat!',
              weight: breed.weight ? 
                `${Math.floor(Math.random() * (parseInt(breed.weight.metric?.split('-')[1] || '8') - parseInt(breed.weight.metric?.split('-')[0] || '3')) + 1) + parseInt(breed.weight.metric?.split('-')[0] || '3')} lbs` :
                `${Math.floor(Math.random() * 8) + 6} lbs`,
              age: `${Math.floor(Math.random() * 15) + 1} years`
            }

            const isBanned = banList.includes(catData.breed) || 
              banList.includes(catData.origin) ||
              banList.includes(catData.temperament) ||
              banList.includes(catData.weight) ||
              banList.includes(catData.age)

            if (!isBanned) {
              validCat = catData
              // Only add to history if this is not the first load (page load)
              if (!isFirstLoad) {
                setHistory(prev => {
                  const filtered = prev.filter(item => item.id !== catData.id)
                  return [catData, ...filtered.slice(0, 9)]
                })
              }
            }
          }
        } catch (fetchError) {
          console.error('Fetch attempt failed:', fetchError)
        }

        attempts++
      }

      if (validCat) {
        setCurrentCat(validCat)
        setIsFirstLoad(false)
      } else {
        setError('Unable to find a cat that matches your criteria. Try removing some items from the ban list.')
      }
    } catch (error) {
      setError(`Failed to fetch cat data: ${error.message}. Please try again.`)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCatData()
  }, [])



  return (
    <div className="app">
      <header className="app-header">
        <h1>Cats-covery</h1>
        <p className="subtitle">Discover cats from around the world</p>
      </header>

      <div className="main-content">
        <div className="discover-section">
          <button 
            className="discover-btn" 
            onClick={fetchCatData} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Discover'}
          </button>

          <div className="debug-info">
            Banned: {banList.length} | History: {history.length}
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}



          {currentCat && (
            <div className="cat-display">
              <div className="cat-image-container">
                <img src={currentCat.image} alt={currentCat.breed} className="cat-image" />
              </div>
              <div className="cat-info">
                <h2 className="cat-title">{currentCat.breed}</h2>
                <div className="attributes">
                  <div className="attribute-row">
                    <span className="label">Breed</span>
                    <span 
                      className={`value clickable ${banList.includes(currentCat.breed) ? 'banned' : ''}`}
                      onClick={() => addToBanList(currentCat.breed)}
                      title="Click to ban this breed"
                    >
                      {currentCat.breed}
                    </span>
                  </div>
                  <div className="attribute-row">
                    <span className="label">Origin</span>
                    <span 
                      className={`value clickable ${banList.includes(currentCat.origin) ? 'banned' : ''}`}
                      onClick={() => addToBanList(currentCat.origin)}
                      title="Click to ban this origin"
                    >
                      {currentCat.origin}
                    </span>
                  </div>
                  <div className="attribute-row">
                    <span className="label">Temperament</span>
                    <span 
                      className={`value clickable ${banList.includes(currentCat.temperament) ? 'banned' : ''}`}
                      onClick={() => addToBanList(currentCat.temperament)}
                      title="Click to ban this temperment"
                    >
                      {currentCat.temperament}
                    </span>
                  </div>
                  <div className="attribute-row">
                    <span className="label">Weight</span>
                    <span 
                      className={`value clickable ${banList.includes(currentCat.weight) ? 'banned' : ''}`}
                      onClick={() => addToBanList(currentCat.weight)}
                      title="Click to ban this weight"
                    >
                      {currentCat.weight}
                    </span>
                  </div>
                  <div className="attribute-row">
                    <span className="label">Age</span>
                    <span 
                      className={`value clickable ${banList.includes(currentCat.age) ? 'banned' : ''}`}
                      onClick={() => addToBanList(currentCat.age)}
                      title="Click to ban this age"
                    >
                      {currentCat.age}
                    </span>
                  </div>
                </div>
                <p className="cat-description">{currentCat.description}</p>
                <p className="click-hint">Click any atribute to ban it</p>
              </div>
            </div>
          )}
        </div>



        <div className="sidebar">
          <div className="ban-list">
            <h3>Banned Items</h3>
            {banList.length === 0 ? (
              <p className="empty-message">No banned items</p>
            ) : (
              <>
                <div className="ban-items">
                  {banList.map((item, index) => (
                    <span 
                      key={index} 
                      className="ban-item"
                      onClick={() => removeFromBanList(item)}
                      title="Click to remove from ban list"
                    >
                      <span className="ban-indicator"></span>
                      {item}
                    </span>
                  ))}
                </div>
                <p className="ban-hint">Click to remove</p>
              </>
            )}
          </div>



          {history.length > 0 && (
            <div className="history">
              <h3>History</h3>
              <p className="history-hint">Click to view again</p>
              <div className="history-items">
                {history.map((cat, index) => (
                  <div 
                    key={cat.id} 
                    className={`history-item ${currentCat && currentCat.id === cat.id ? 'current' : ''}`}
                    onClick={() => goBackToCat(cat)}
                    title={`View ${cat.breed} again`}
                  >
                    <img src={cat.image} alt={cat.breed} className="history-image" />
                    <div className="history-info">
                      <p className="history-name">{cat.breed}</p>
                      <p className="history-origin">{cat.origin}</p>
                      <p className="history-breed">{cat.temperament}</p>
                    </div>
                    {currentCat && currentCat.id === cat.id && (
                      <div className="current-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
