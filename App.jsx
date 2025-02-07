import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const words = [
    // List of words...
  ];

  const [imageArrays, setImageArrays] = useState({});
  const [currentArray, setCurrentArray] = useState('bg2');
  const [selectedImages, setSelectedImages] = useState([]);
  const [jumpTo, setJumpTo] = useState('');

  // Fallback image path in case of error
  const fallbackImage = './bg2.png'; 

  useEffect(() => {
    const importImages = async () => {
      const imageFiles = import.meta.glob('./assets/*.png');  // Dynamically import all .png files
      const processedArrays = {};

      for (const path in imageFiles) {
        const imageModule = await imageFiles[path]();
        const filename = path.split('/').pop();

        // Strip query parameters (e.g., ?import)
        const imagePath = imageModule.default.replace(/\?import$/, '');

        const bgMatch = filename.match(/^bg\d+\.png$/); // Match bg1.png, bg12.png, etc.
        if (bgMatch) {
          const bgNumber = filename.match(/bg\d+/)[0]; // bg1, bg12, etc.
          const imageData = {
            image: imagePath,
            location: '',
            Inumber: '',
            version: '',
            condition: ''
          };

          if (!processedArrays[bgNumber]) {
            processedArrays[bgNumber] = [];
          }
          processedArrays[bgNumber].push(imageData);
        } else {
          // Handle complex filenames with additional details
          const bgNumber = filename.match(/bg\d+/)[0];
          const Inumber = filename.match(/I\d+/);
          const version = filename.match(/V\d/);
          const location = filename.includes('_U_') ? 'U' : 'E';
          const condition = filename.match(/_([A-Z]+)\.png$/)[1];

          const imageData = {
            image: imagePath,
            location,
            Inumber,
            version,
            condition
          };

          if (!processedArrays[bgNumber]) {
            processedArrays[bgNumber] = [];
          }
          processedArrays[bgNumber].push(imageData);
        }
      }

      setImageArrays(processedArrays);
    };

    importImages();
  }, []);

  const handleNext = () => {
    const bgNumbers = Object.keys(imageArrays)
      .map(key => ({
        key,
        num: parseInt(key.replace('bg', ''), 10) // Extract the numeric part of bg1, bg2, etc.
      }))
      .sort((a, b) => a.num - b.num); // Sort by the numeric part
    
    const currentIndex = bgNumbers.findIndex(item => item.key === currentArray);
    const nextIndex = (currentIndex + 1) % bgNumbers.length;
    setCurrentArray(bgNumbers[nextIndex].key);
  };
  
  const handlePrev = () => {
    const bgNumbers = Object.keys(imageArrays)
      .map(key => ({
        key,
        num: parseInt(key.replace('bg', ''), 10) // Extract the numeric part of bg1, bg2, etc.
      }))
      .sort((a, b) => a.num - b.num); // Sort by the numeric part
    
    const currentIndex = bgNumbers.findIndex(item => item.key === currentArray);
    const prevIndex = (currentIndex - 1 + bgNumbers.length) % bgNumbers.length;
    setCurrentArray(bgNumbers[prevIndex].key);
  };

  const handleCheckbox = (imagePath) => {
    setSelectedImages(prev => {
      if (prev.includes(imagePath)) {
        return prev.filter(path => path !== imagePath);
      } else {
        return [...prev, imagePath];
      }
    });
  };

  const handleGenerateFile = () => {
    const selectedImageNames = [];

    Object.keys(imageArrays).forEach(bg => {
      imageArrays[bg].forEach(item => {
        if (selectedImages.includes(item.image)) {
          selectedImageNames.push(`${bg}_${item.version}_${item.location}_${item.condition}`);
        }
      });
    });

    const blob = new Blob([selectedImageNames.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'selected_images.txt';
    link.click();
  };

  const handleJumpTo = () => {
    // Ensure the input is not empty and is a valid number
    const bgInput = jumpTo.trim();
    if (bgInput && !isNaN(bgInput)) {
      const formattedBg = `bg${bgInput}`; // Format input to bg<number>
  
      if (imageArrays[formattedBg]) {
        setCurrentArray(formattedBg);
        setJumpTo(''); // Reset the input field
      } else {
        alert(`Array "${formattedBg}" does not exist.`);
      }
    } else {
      alert('Please enter a valid number.');
    }
  };

  return (
    <div className="container">
      <h2 className="text"> {currentArray} Images</h2>
      <div className="grid-container">
        {imageArrays[currentArray]?.map((item, index) => (
          <div key={index} className="card">
            <p className="text">Location: {item.location} Condition: {item.condition}</p>
            <img
              src={item.image}
              alt={`${currentArray}_${item.Inumber}_${item.version}_${item.location}_${item.condition}`}
              className="image"
              style={{ width: '460px', height: '360px' }}
              onError={(e) => e.target.src = fallbackImage}  // Set fallback image on error
            />
            <p className="text">Bg Name: {`${currentArray} ${item.Inumber} ${item.version} ${item.location} ${item.condition}`}</p>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id={`checkbox-${item.image}`}
                checked={selectedImages.includes(item.image)}
                onChange={() => handleCheckbox(item.image)}
                className="checkbox"
              />
              <label htmlFor={`checkbox-${item.image}`}>Needs Changes</label>
            </div>
          </div>
        ))}
      </div>
      <div className="button-container">
        <button onClick={handlePrev} className="button">Previous</button>
        <button onClick={handleNext} className="button">Next</button>
        <button onClick={handleGenerateFile} className="button">Generate File</button>
        <button onClick={handleJumpTo} className="button">Jump To</button>
        <input
          type="text"
          value={jumpTo}
          onChange={(e) => setJumpTo(e.target.value)}
          placeholder="Enter bg number (e.g., 120)"
          className="jump-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleJumpTo(); // Call the jump function when Enter is pressed
            }
          }} style={{ width: '200px',   height: '30px'}}
        />
      </div>
    </div>
  );
}


export default App;