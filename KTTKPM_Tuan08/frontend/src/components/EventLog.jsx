function EventLog({ logs }) {
    return (
        <div>
            <h2 style={{ color: '#e94560', marginBottom: 16 }}>Event Log</h2>
            <div className="event-log">
                {logs.length === 0 ? (
                    <div className="no-data">Chưa có event nào</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="log-item">
                            <span className="event-name">[{log.event}]</span> {log.detail}
                            <div className="time">{log.time}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EventLog;
