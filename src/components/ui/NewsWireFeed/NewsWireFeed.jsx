import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils'
import './NewsWireFeed.css'

const NewsWireFeed = ({ feedService, title, color }) => {
    const { data: news, loading } = useFeedData(
        () => feedService(10),
        10 * 60 * 1000
    )

    return (
        <div className="news-wire-feed" data-color={color}>
            <div className="news-wire-title">{title}</div>
            <div className="news-wire-container">
                {loading && news.length === 0 ? (
                    <div className="loading-msg">Loading news...</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="news-wire-item">
                            <div className="news-wire-header">
                                <span className="news-wire-source">{item.source}</span>
                                <span className="news-wire-time">{getTimeAgo(item.date)}</span>
                            </div>
                            <span className="news-wire-title">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default NewsWireFeed
