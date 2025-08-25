# Operational Runbooks - Courtroom Simulator

## SLO Dashboards & Alerts

### Key Metrics to Monitor

#### Performance SLOs
- **Objection Latency**: < 2 seconds for objection suggestions
- **Transcript Lag**: < 1 second for real-time transcript updates
- **Export Success Rate**: > 99% for trial bundle exports
- **API Response Time**: < 500ms for 95th percentile

#### Availability SLOs
- **Service Uptime**: > 99.9% for all services
- **Database Connectivity**: < 1 minute downtime per month
- **Redis Availability**: < 30 seconds downtime per month
- **NATS Message Delivery**: > 99.99% success rate

### Alert Thresholds

```yaml
# Example Prometheus alert rules
groups:
  - name: courtroom-simulator
    rules:
      - alert: HighObjectionLatency
        expr: histogram_quantile(0.95, objection_processing_duration_seconds) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Objection processing latency is high"
          
      - alert: ExportFailureRate
        expr: rate(export_failures_total[5m]) / rate(export_requests_total[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Export failure rate is above 1%"
          
      - alert: DatabaseConnectionErrors
        expr: rate(database_connection_errors_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection errors detected"
```

### Dashboard Queries

```sql
-- Objection latency by case type
SELECT 
  case_type,
  AVG(processing_time_ms) as avg_latency,
  PERCENTILE(processing_time_ms, 95) as p95_latency
FROM objection_events 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY case_type;

-- Export success rate by format
SELECT 
  format,
  COUNT(*) as total_exports,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_exports,
  (SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM export_events 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY format;
```

## PII Redaction Checklist

### Data Classification

#### High Sensitivity (Requires Immediate Redaction)
- Social Security Numbers
- Credit Card Numbers
- Bank Account Numbers
- Passport Numbers
- Driver's License Numbers
- Medical Record Numbers

#### Medium Sensitivity (Redact in Exports)
- Full Names (in certain contexts)
- Addresses
- Phone Numbers
- Email Addresses
- Dates of Birth
- Financial Information

#### Low Sensitivity (Optional Redaction)
- Company Names
- Public Court Records
- General Location Information

### Redaction Process

1. **Automated Detection**
   ```python
   # Example redaction patterns
   patterns = {
       'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
       'credit_card': r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
       'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
       'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
   }
   ```

2. **Manual Review Process**
   - All automated redactions must be reviewed by a human
   - False positives should be logged and patterns updated
   - Redaction decisions should be documented

3. **Export Controls**
   - All exports should have PII redaction applied
   - Different redaction levels for different export types
   - Audit trail of all redaction actions

### Retention Policies

#### Temporary Files (90 days)
- Uploaded exhibits before processing
- Temporary export files
- Cache files
- Log files

#### Long-term Storage (365 days)
- Processed exhibits
- Final trial bundles
- Audit logs
- Backup files

#### Permanent Storage
- Case metadata (redacted)
- Statistical data (anonymized)
- System configuration

## Incident Playbooks

### WebSocket Degradation

#### Symptoms
- Real-time updates not appearing
- Connection timeouts
- High error rates in WebSocket connections

#### Immediate Actions
1. **Check WebSocket Service Status**
   ```bash
   # Check if WebSocket service is running
   docker ps | grep websocket
   
   # Check WebSocket logs
   docker logs courtroom-simulator-gateway-1 | grep -i websocket
   ```

2. **Monitor Connection Counts**
   ```sql
   -- Check active WebSocket connections
   SELECT COUNT(*) as active_connections 
   FROM websocket_sessions 
   WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';
   ```

3. **Restart WebSocket Service if Needed**
   ```bash
   docker restart courtroom-simulator-gateway-1
   ```

#### Escalation
- If restart doesn't resolve: Check NATS connectivity
- If NATS is down: Follow NATS incident playbook
- If persistent: Check for memory/CPU issues

### NATS Backlog

#### Symptoms
- Messages not being processed
- High message queue depth
- Slow trial progression
- Worker tasks not starting

#### Immediate Actions
1. **Check NATS Queue Depth**
   ```bash
   # Connect to NATS and check queue stats
   nats-sub -s nats://localhost:4222 -q courtroom.trials
   ```

2. **Monitor Worker Status**
   ```bash
   # Check Celery worker status
   celery -A app.celery_app inspect active
   celery -A app.celery_app inspect stats
   ```

3. **Scale Workers if Needed**
   ```bash
   # Scale up workers
   docker-compose up -d --scale workers=3
   ```

#### Escalation
- If workers are overloaded: Add more worker instances
- If NATS is overwhelmed: Check for message storms
- If persistent: Review message patterns and optimize

### Redis Eviction

#### Symptoms
- Cache misses increasing
- Idempotency failures
- Session data loss
- Performance degradation

#### Immediate Actions
1. **Check Redis Memory Usage**
   ```bash
   # Connect to Redis and check memory
   redis-cli info memory
   redis-cli info stats
   ```

2. **Monitor Eviction Events**
   ```bash
   # Check eviction statistics
   redis-cli info stats | grep evicted
   ```

3. **Increase Memory if Needed**
   ```yaml
   # In docker-compose.yml
   redis:
     image: redis:7-alpine
     command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
   ```

#### Escalation
- If memory is insufficient: Increase Redis memory allocation
- If eviction rate is high: Review cache usage patterns
- If persistent: Implement cache warming strategies

### Database Connection Pool Exhaustion

#### Symptoms
- Database connection timeouts
- High connection wait times
- Application errors about connection limits
- Slow query performance

#### Immediate Actions
1. **Check Connection Pool Status**
   ```sql
   -- Check active connections
   SELECT count(*) as active_connections 
   FROM pg_stat_activity 
   WHERE state = 'active';
   
   -- Check connection pool usage
   SELECT * FROM pg_stat_database;
   ```

2. **Monitor Connection Wait Times**
   ```sql
   -- Check for connection waits
   SELECT * FROM pg_stat_activity 
   WHERE wait_event_type = 'Client';
   ```

3. **Increase Connection Pool Size**
   ```python
   # In database configuration
   DATABASE_URL = "postgresql://user:pass@host:port/db?pool_size=20&max_overflow=30"
   ```

#### Escalation
- If pool is consistently full: Increase pool size
- If connections are hanging: Check for long-running queries
- If persistent: Review connection management patterns

## Recovery Procedures

### Service Recovery
1. **Identify Affected Services**
2. **Check Service Logs**
3. **Restart Services in Order**
4. **Verify Service Health**
5. **Monitor for Recurrence**

### Data Recovery
1. **Identify Data Loss Scope**
2. **Restore from Latest Backup**
3. **Replay Transaction Logs**
4. **Verify Data Integrity**
5. **Update Monitoring**

### Communication Plan
1. **Internal Alert**: Immediate notification to on-call engineer
2. **Team Notification**: Alert to development team within 15 minutes
3. **Stakeholder Update**: Status update to stakeholders within 1 hour
4. **Post-Incident Review**: Document lessons learned within 24 hours
