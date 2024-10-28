// Album Grid Component
const AlbumGrid = ({ onAlbumClick, selectedUrl }) => {
    const albumData = [
      {
        src: 'albums/distraction.jpg',
        alt: 'Distraction',
        embedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=1162107842/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/'
      },
      {
        src: 'albums/sweat.jpg',
        alt: 'SWEAT',
        embedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=3509520382/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/'
      },
      {
        src: 'albums/wereone.jpg',
        alt: "We're One (Blowout edit)",
        embedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=3242474619/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/'
      }
    ];
  
    return (
      <div className="album-grid">
        {albumData.map((album, index) => (
          <div 
            key={index}
            className={`album-container ${selectedUrl === album.embedUrl ? 'selected' : ''}`}
            onClick={() => onAlbumClick(album)}
          >
            <img
              src={album.src}
              alt={album.alt}
              className="album-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
};
  
// Main App Component
const App = () => {
    const [showSplash, setShowSplash] = React.useState(true);
    const [activeSection, setActiveSection] = React.useState('home');
    const [selectedAlbum, setSelectedAlbum] = React.useState(null);
    const [content, setContent] = React.useState({});
    const [error, setError] = React.useState(null);
    const [touchStart, setTouchStart] = React.useState(0);
    const [touchEnd, setTouchEnd] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [audioElement, setAudioElement] = React.useState(null);
    const [visualizer, setVisualizer] = React.useState(null);
    const [isLeavingHome, setIsLeavingHome] = React.useState(false);
    const [showGiveaway, setShowGiveaway] = React.useState(false);

    const fadeOutDuration = 1000;
  
    const navItems = [
      { name: 'Home', icon: 'fa-house' },
      { name: 'Music', icon: 'fa-music' },
      { name: 'Remixes', icon: 'fa-compact-disc' },
      { name: 'About', icon: 'fa-user' },
      { name: 'Contact', icon: 'fa-envelope' }
    ];
  
    // Content Loading Effect
    React.useEffect(() => {
      fetch('content.md')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load content');
          }
          return response.text();
        })
        .then(text => {
          const sections = text.split('##').slice(1);
          const parsedContent = {};
          sections.forEach(section => {
            const [title, ...contentLines] = section.trim().split('\n');
            parsedContent[title.toLowerCase().trim()] = contentLines.join('\n').trim();
          });
          setContent(parsedContent);
        })
        .catch(err => {
          console.error('Content loading error:', err);
          setError(err.message);
        });
    }, []);
  
    // Splash Screen Effect
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const splashElement = document.querySelector('.splash-screen');
        if (splashElement) {
          splashElement.classList.add('fade-out');
          
          setTimeout(() => {
            setShowSplash(false);
          }, 1000);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    // Giveaway Effect
    React.useEffect(() => {
        const hasBeenShown = localStorage.getItem('giveawayShown') === 'true';
        if (!hasBeenShown && !showGiveaway) {
            const timer = setTimeout(() => {
                setShowGiveaway(true);
                console.log('Showing giveaway popup');
            }, 60000);
            return () => clearTimeout(timer);
        }
    }, [showGiveaway]);

    // Audio Setup Effect
    React.useEffect(() => {
        let audio = null;
        let visualizerInstance = null;

        const initAudio = () => {
            try {
                audio = new Audio('neekoo.mp3');
                audio.volume = 1;
                setAudioElement(audio);
                
                if (typeof window.AudioVisualizer !== 'undefined') {
                    visualizerInstance = new window.AudioVisualizer();
                    setVisualizer(visualizerInstance);
                } else {
                    console.error('AudioVisualizer not loaded');
                }
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };

        if (document.readyState === 'complete') {
            initAudio();
        } else {
            window.addEventListener('load', initAudio);
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
            window.removeEventListener('load', initAudio);
        };
    }, []);

    // Section Change Effect
    React.useEffect(() => {
        if (activeSection !== 'home' && isPlaying) {
            setIsLeavingHome(true);
            
            if (audioElement) {
                const fadeInterval = setInterval(() => {
                    if (audioElement.volume > 0.1) {
                        audioElement.volume = Math.max(0, audioElement.volume - 0.1);
                    } else {
                        clearInterval(fadeInterval);
                        audioElement.pause();
                        setIsPlaying(false);
                        setIsLeavingHome(false);
                    }
                }, fadeOutDuration / 10);
            }

            if (visualizer?.canvas) {
                visualizer.canvas.style.opacity = '0';
            }
        }
    }, [activeSection, audioElement, isPlaying, visualizer]);
  
    // Touch Handlers
    const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
    };
  
    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
  
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const sections = navItems.map(item => item.name.toLowerCase());
      const currentIndex = sections.indexOf(activeSection);
      
      if (Math.abs(distance) > 50) {
        if (distance > 0 && currentIndex < sections.length - 1) {
          setActiveSection(sections[currentIndex + 1]);
        } else if (distance < 0 && currentIndex > 0) {
          setActiveSection(sections[currentIndex - 1]);
        }
      }
    };

    // Handle section change
    const handleSectionChange = (section) => {
        if (section !== 'home' && isPlaying) {
            setIsLeavingHome(true);
            
            if (audioElement) {
                const fadeInterval = setInterval(() => {
                    if (audioElement.volume > 0.1) {
                        audioElement.volume = Math.max(0, audioElement.volume - 0.1);
                    } else {
                        clearInterval(fadeInterval);
                        audioElement.pause();
                        setIsPlaying(false);
                        setIsLeavingHome(false);
                    }
                }, fadeOutDuration / 10);
            }

            if (visualizer?.canvas) {
                visualizer.canvas.style.opacity = '0';
            }
        }
        
        setActiveSection(section);
    };

    // Audio Play/Pause Handler
    const togglePlay = async () => {
        if (!audioElement || !visualizer) {
            console.warn('Audio or visualizer not initialized');
            return;
        }
        
        try {
            if (isPlaying) {
                const fadeInterval = setInterval(() => {
                    if (audioElement.volume > 0.1) {
                        audioElement.volume = Math.max(0, audioElement.volume - 0.1);
                    } else {
                        clearInterval(fadeInterval);
                        audioElement.pause();
                        setIsPlaying(false);
                    }
                }, fadeOutDuration / 10);

                visualizer.canvas.style.opacity = '0';
            } else {
                audioElement.volume = 0;
                await audioElement.play();
                
                if (!visualizer.isSetup) {
                    await visualizer.setupAudio(audioElement);
                    visualizer.start();
                    visualizer.isSetup = true;
                }
                
                visualizer.canvas.style.opacity = '1';
                
                const fadeInterval = setInterval(() => {
                    if (audioElement.volume < 0.9) {
                        audioElement.volume = Math.min(1, audioElement.volume + 0.1);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, fadeOutDuration / 10);
                
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling play:', error);
        }
    };
  
    // Content Renderer
    const renderContent = () => {
      if (error) {
        return <div>Error loading content: {error}</div>;
      }

      if (activeSection === 'home') {
        return (
            <div className="home-content">
                <button 
                    className="play-button" 
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    disabled={isLeavingHome}
                >
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>
                <div dangerouslySetInnerHTML={{ 
                    __html: marked.parse(content[activeSection] || '') 
                }} />
            </div>
        );
      }
  
      if (activeSection === 'remixes') {
        return (
            <div>
                <h3>Neekoo Remixes</h3>
                <div className="iframe-container">
                    <iframe 
                        width="100%" 
                        height="300" 
                        scrolling="no" 
                        frameBorder="no" 
                        allow="autoplay" 
                        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1707833436&color=%23cc2dd5&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
                    ></iframe>
                    <div className="soundcloud-info">
                        <a 
                            href="https://soundcloud.com/neekoo-1" 
                            title="Neekoo" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Neekoo
                        </a>
                        {' · '}
                        <a 
                            href="https://soundcloud.com/neekoo-1/sets/remixes" 
                            title="Remixes" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Remixes
                        </a>
                    </div>
                </div>
            </div>
        );
      }
  
      if (activeSection === 'music') {
        return (
            <div>
                <h3>Latest Releases</h3>
                {selectedAlbum && (
                    <div className="iframe-container">
                        <iframe
                            style={{ 
                                border: 0, 
                                width: '100%', 
                                height: '120px',
                                maxWidth: '100%',
                                borderRadius: '0.5rem'
                            }}
                            src={selectedAlbum.embedUrl}
                            seamless
                            loading="lazy"
                        ></iframe>
                    </div>
                )}
                <AlbumGrid 
                    onAlbumClick={setSelectedAlbum}
                    selectedUrl={selectedAlbum ? selectedAlbum.embedUrl : null}
                />
            </div>
        );
      }
  
      return (
        <div dangerouslySetInnerHTML={{ 
          __html: marked.parse(content[activeSection] || '') 
        }} />
      );
    };
  
    if (showSplash) {
      return (
        <div className="splash-screen">
          <div className="overlay"></div>
          <h1 className="splash-title">NEEKOO</h1>
        </div>
      );
    }
  
    return (
        <div 
            className="min-h-screen"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <nav>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name.toLowerCase()}>
                            <a
                                href={`#${item.name.toLowerCase()}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSectionChange(item.name.toLowerCase());
                                }}
                                className={activeSection === item.name.toLowerCase() ? 'active' : ''}
                            >
                                <i className={`fas ${item.icon}`}></i>
                                <span className="nav-text">{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
  
            <main>
                <h2 className="page-title">
                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h2>
                <div className="container">
                    <div className="content-container">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {showGiveaway && window.GiveawayPopup && (
                <window.GiveawayPopup 
                    onClose={() => {
                        setShowGiveaway(false);
                        localStorage.setItem('giveawayShown', 'true');
                    }}
                />
            )}
        </div>
    );
};

// React 18 rendering
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
