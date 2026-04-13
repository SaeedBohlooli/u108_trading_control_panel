import appConfig from '../config/appConfig'

function PageFooter() {
  const footerText = appConfig.footer?.text || 'Trading Control Panel Dashboard @ Zoitek.com   2014 - 2025'
  const footerLink = appConfig.footer?.link || 'https://zoitek.com'

  return (
    <footer style={{ 
      marginTop: 30, 
      paddingTop: 20, 
      paddingBottom: 60,
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: 14
    }}>
      <p style={{ margin: 0 }}>
        <a 
          href={footerLink} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#9ca3af', 
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          {footerText}
        </a>
      </p>
    </footer>
  )
}

export default PageFooter
