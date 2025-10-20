# 🔄 Agent Communication Protocol & Coordination System

## Overview

This document defines the communication protocol between all agents working on the Nail App project, ensuring seamless coordination, knowledge sharing, and conflict prevention.

## 🤖 Available Agents & Roles

### Active Agents for Nail App Development

| Agent | Role | Key Responsibilities | Communication Priority |
|-------|------|---------------------|----------------------|
| **project-orchestrator** | Project Manager | Overall coordination, task distribution, conflict resolution | **HIGH** - Central hub |
| **supabase-architect** | Backend Expert | Database, storage, real-time features | **HIGH** - Critical path |
| **security-audit-specialist** | Security Guard | Security reviews, compliance, vulnerability checks | **CRITICAL** - Can block |
| **refactoring-architect** | Code Quality | Architecture, performance, clean code | **MEDIUM** - Advisory |
| **qa-test-engineer** | Quality Assurance | Testing, bug tracking, device testing | **HIGH** - Gates releases |
| **general-purpose** (x4) | Feature Builders | UI components, features, integrations | **MEDIUM** - Executors |
| **debug-detective** | Problem Solver | Bug fixes, issue investigation | **ON-DEMAND** - As needed |

### Missing But Not Critical

- ❌ **UI/UX Designer Agent** - Covered by general-purpose with design specs
- ❌ **DevOps Agent** - Covered by orchestrator for simple Vercel deployment
- ❌ **Documentation Agent** - Each agent documents their own work

## 📡 Communication Architecture

### Hierarchical Communication Model

```
                    ┌──────────────────┐
                    │   Orchestrator   │ (Central Hub)
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │Security │         │Supabase │         │   QA    │ (Critical Path)
   │ Audit   │◄────────┤Architect│         │Engineer │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │           │        │        │           │
   ┌────▼────┐ ┌────▼────┐ ┌▼───┐ ┌──▼──┐ ┌────▼────┐
   │General 1│ │General 2│ │Gen 3│ │Gen 4│ │Refactor │ (Feature Level)
   └─────────┘ └─────────┘ └─────┘ └─────┘ └─────────┘
```

## 📋 Communication Protocol

### 1. Standard Reporting Structure

Every agent MUST report using this format:

```typescript
interface AgentReport {
  // Identification
  agent: string;              // Agent name
  taskId: string;            // Unique task identifier
  timestamp: Date;           // Report time
  
  // Status
  status: 'started' | 'in-progress' | 'blocked' | 'completed' | 'failed';
  progress: number;          // 0-100 percentage
  
  // Work Done
  changes: {
    files: {
      created: string[];     // New files created
      modified: string[];    // Files modified
      deleted: string[];     // Files deleted
    };
    dependencies: {
      added: string[];       // New npm packages
      removed: string[];     // Removed packages
      updated: string[];     // Updated packages
    };
    database: {
      migrations: string[];  // New migrations
      schemas: string[];     // Schema changes
      policies: string[];    // RLS policy changes
    };
    api: {
      endpoints: string[];   // New/modified endpoints
      contracts: any[];      // API contract changes
    };
  };
  
  // Communication
  blockers: string[];        // Current blockers
  dependencies: string[];    // Waiting on other agents
  warnings: string[];        // Potential issues
  questions: string[];       // Need clarification
  
  // Handoff
  nextSteps: string[];       // What comes next
  handoffTo: string[];       // Which agents need this
  
  // Documentation
  documentation: {
    inline: boolean;         // Code comments added
    readme: boolean;         // README updated
    api: boolean;           // API docs updated
    tests: boolean;         // Tests documented
  };
}
```

### 2. Communication Channels

```yaml
Synchronous Channels:
  Daily Standup:
    Time: Start of each work session
    Participants: All active agents
    Format: Status updates using AgentReport
    
  Blocker Resolution:
    Trigger: Any agent blocked
    Participants: Orchestrator + blocked agent + blocking agent
    Format: Immediate sync to resolve
    
  Critical Decision:
    Trigger: Architecture/security decision needed
    Participants: Orchestrator + relevant experts
    Format: Consensus required

Asynchronous Channels:
  Progress Updates:
    Frequency: Every 2 hours or on completion
    Format: AgentReport to shared log
    
  Code Reviews:
    Trigger: Feature complete
    Format: PR with review request
    
  Documentation:
    Continuous: Update as you code
    Format: Inline + markdown files
```

### 3. Inter-Agent Direct Communication

Agents can communicate directly for specific needs:

```typescript
class InterAgentCommunication {
  // Agent-to-Agent messaging
  async sendMessage(
    from: AgentType,
    to: AgentType,
    message: {
      type: 'question' | 'update' | 'request' | 'response';
      priority: 'low' | 'medium' | 'high' | 'critical';
      content: string;
      context?: any;
      needsResponse: boolean;
    }
  ): Promise<void> {
    // Log to orchestrator
    await this.notifyOrchestrator(from, to, message);
    
    // Send to target agent
    await this.deliverMessage(to, message);
    
    // Track for response if needed
    if (message.needsResponse) {
      await this.trackForResponse(from, to, message);
    }
  }
  
  // Broadcast to multiple agents
  async broadcast(
    from: AgentType,
    message: {
      type: 'announcement' | 'warning' | 'update';
      content: string;
      affectedAgents: AgentType[];
    }
  ): Promise<void> {
    // Notify all affected agents
    for (const agent of message.affectedAgents) {
      await this.sendMessage(from, agent, {
        type: 'update',
        priority: 'medium',
        content: message.content,
        needsResponse: false
      });
    }
  }
}
```

## 🔔 Notification Rules

### Critical Notifications (Immediate)

```yaml
Security Issues:
  Trigger: Security vulnerability found
  From: security-audit-specialist
  To: ALL agents
  Action: STOP all work until resolved
  
API Breaking Changes:
  Trigger: API contract change
  From: Any agent
  To: All dependent agents
  Action: Update implementations
  
Database Schema Changes:
  Trigger: Migration created/modified
  From: supabase-architect
  To: All backend agents
  Action: Update types and queries
  
Test Failures:
  Trigger: Tests failing after change
  From: qa-test-engineer
  To: Agent who made change
  Action: Fix immediately
```

### Standard Notifications (Within 1 hour)

```yaml
Feature Complete:
  From: general-purpose agent
  To: qa-test-engineer, orchestrator
  Content: Feature ready for testing
  
Code Review Ready:
  From: Any agent
  To: refactoring-architect, orchestrator
  Content: PR ready for review
  
Documentation Update:
  From: Any agent
  To: orchestrator
  Content: Docs updated for feature
```

## 📊 Knowledge Sharing System

### Shared Knowledge Base

```typescript
interface SharedKnowledge {
  // Project State
  projectState: {
    currentPhase: number;
    completedTasks: string[];
    pendingTasks: string[];
    blockers: string[];
  };
  
  // Technical Decisions
  decisions: {
    id: string;
    decision: string;
    rationale: string;
    madeBy: string;
    date: Date;
    affectedAgents: string[];
  }[];
  
  // API Contracts
  apiContracts: {
    endpoint: string;
    method: string;
    request: any;
    response: any;
    owner: string;
    consumers: string[];
  }[];
  
  // Component Registry
  components: {
    name: string;
    path: string;
    owner: string;
    dependents: string[];
    props: any;
    tests: string[];
  }[];
  
  // Known Issues
  issues: {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    assignedTo: string;
    status: string;
  }[];
}

// Each agent must update the knowledge base
class AgentKnowledgeUpdater {
  async updateOnChange(change: any): Promise<void> {
    const kb = await this.getKnowledgeBase();
    
    // Update relevant sections
    if (change.type === 'api') {
      kb.apiContracts.push(change.contract);
    }
    
    if (change.type === 'component') {
      kb.components.push(change.component);
    }
    
    if (change.type === 'decision') {
      kb.decisions.push(change.decision);
    }
    
    await this.saveKnowledgeBase(kb);
    await this.notifyAffectedAgents(change);
  }
}
```

## 🚨 Conflict Resolution Protocol

### Conflict Detection

```typescript
class ConflictDetector {
  detectConflicts(reports: AgentReport[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // File conflicts
    const fileModifications = new Map<string, string[]>();
    reports.forEach(report => {
      report.changes.files.modified.forEach(file => {
        if (!fileModifications.has(file)) {
          fileModifications.set(file, []);
        }
        fileModifications.get(file)!.push(report.agent);
      });
    });
    
    // Detect multiple agents modifying same file
    fileModifications.forEach((agents, file) => {
      if (agents.length > 1) {
        conflicts.push({
          type: 'file-conflict',
          file,
          agents,
          severity: 'high'
        });
      }
    });
    
    // API conflicts
    const apiChanges = new Map<string, string[]>();
    reports.forEach(report => {
      report.changes.api.endpoints.forEach(endpoint => {
        if (!apiChanges.has(endpoint)) {
          apiChanges.set(endpoint, []);
        }
        apiChanges.get(endpoint)!.push(report.agent);
      });
    });
    
    return conflicts;
  }
}
```

### Resolution Process

```yaml
Conflict Resolution Steps:
  1. Detection:
     - Orchestrator detects conflict
     - Identifies involved agents
     
  2. Notification:
     - Notify involved agents
     - Pause conflicting work
     
  3. Analysis:
     - Compare changes
     - Determine compatibility
     
  4. Resolution:
     File Conflicts:
       - Merge if compatible
       - Choose primary if incompatible
       - Refactor if necessary
       
     API Conflicts:
       - Ensure backward compatibility
       - Version if breaking change
       - Update all consumers
       
     Schema Conflicts:
       - Coordinate migration order
       - Ensure data integrity
       - Update all queries
       
  5. Verification:
     - Run tests
     - Validate integration
     - Update documentation
     
  6. Resume:
     - Notify agents of resolution
     - Resume paused work
     - Update knowledge base
```

## 📝 Documentation Requirements

### Each Agent Must Document

```markdown
## Code Level Documentation

1. **File Headers**
```typescript
/**
 * File: ComponentName.tsx
 * Agent: general-purpose-1
 * Created: 2024-01-10
 * Modified: 2024-01-11
 * Dependencies: React, Tailwind
 * Consumers: PageX, PageY
 * Tests: ComponentName.test.tsx
 */
```

2. **Function Documentation**
```typescript
/**
 * Transforms nail color using Gemini API
 * @agent general-purpose-2
 * @param image - Base64 encoded image
 * @param color - Selected color configuration
 * @returns Transformed image URL
 * @throws GeminiAPIError if transformation fails
 * @security Validates image size and type
 * @performance Caches results for 24 hours
 */
```

3. **Change Log**
```typescript
/**
 * CHANGELOG:
 * 2024-01-10 [general-purpose-1]: Initial implementation
 * 2024-01-11 [security-audit]: Added input validation
 * 2024-01-12 [refactoring-arch]: Optimized performance
 */
```

## Decision Log

All technical decisions must be logged:

```yaml
Decision: Use Zustand for state management
Agent: orchestrator
Date: 2024-01-10
Rationale: Simpler than Redux, better TypeScript support
Affected Agents: All general-purpose agents
Alternatives Considered: Redux, Context API, Jotai
```

## API Change Log

```yaml
Endpoint: /api/transform
Agent: general-purpose-3
Date: 2024-01-11
Change: Added 'style' parameter
Breaking: No
Consumers Updated: 
  - general-purpose-1 (UI)
  - qa-test-engineer (tests)
Migration: None required
```
```

## 🔄 Daily Communication Flow

### Morning Sync (Start of Day)

```typescript
class DailySync {
  async morningSync(): Promise<void> {
    // 1. Orchestrator checks overnight work
    const overnightReports = await this.getOvernightReports();
    
    // 2. Detect conflicts
    const conflicts = await this.detectConflicts(overnightReports);
    
    // 3. Resolve conflicts
    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts);
    }
    
    // 4. Update knowledge base
    await this.updateKnowledgeBase(overnightReports);
    
    // 5. Distribute daily tasks
    const dailyTasks = await this.getDailyTasks();
    await this.distributeTasks(dailyTasks);
    
    // 6. Set sync points
    await this.scheduleSyncPoints();
  }
}
```

### Continuous Monitoring

```typescript
class ContinuousMonitor {
  async monitor(): Promise<void> {
    setInterval(async () => {
      // Check for blockers
      const blockers = await this.checkBlockers();
      if (blockers.length > 0) {
        await this.escalateBlockers(blockers);
      }
      
      // Check for completed tasks
      const completed = await this.checkCompleted();
      if (completed.length > 0) {
        await this.handleCompletions(completed);
      }
      
      // Check for conflicts
      const conflicts = await this.checkConflicts();
      if (conflicts.length > 0) {
        await this.resolveConflicts(conflicts);
      }
      
      // Update progress
      await this.updateProgress();
      
    }, 30 * 60 * 1000); // Every 30 minutes
  }
}
```

### End of Day Sync

```typescript
class EndOfDaySync {
  async eveningSync(): Promise<void> {
    // 1. Collect all reports
    const allReports = await this.collectAllReports();
    
    // 2. Validate completions
    const validation = await this.validateWork(allReports);
    
    // 3. Run integration tests
    const testResults = await this.runIntegrationTests();
    
    // 4. Update documentation
    await this.updateDocumentation(allReports);
    
    // 5. Prepare tomorrow's plan
    const tomorrowPlan = await this.prepareTomorrowPlan();
    
    // 6. Generate status report
    const statusReport = await this.generateStatusReport({
      completed: validation.completed,
      pending: validation.pending,
      blockers: validation.blockers,
      tomorrow: tomorrowPlan
    });
    
    // 7. Request user approval
    await this.requestUserApproval(statusReport);
  }
}
```

## 🎯 Communication Success Metrics

```yaml
Metrics to Track:
  Response Time:
    - Critical issues: <5 minutes
    - High priority: <30 minutes
    - Medium priority: <2 hours
    - Low priority: <4 hours
    
  Conflict Rate:
    - File conflicts: <5% of changes
    - API conflicts: <2% of changes
    - Schema conflicts: <1% of changes
    
  Knowledge Sharing:
    - Documentation coverage: 100%
    - Decision logging: 100%
    - API documentation: 100%
    
  Integration Success:
    - Daily integration: 100% success
    - Test pass rate: >95%
    - Blocker resolution: <4 hours
```

## 🚀 Implementation Checklist

```markdown
## For Orchestrator
□ Set up communication channels
□ Create shared knowledge base
□ Implement conflict detection
□ Schedule sync points
□ Monitor agent progress
□ Handle escalations
□ Generate daily reports

## For All Agents
□ Implement AgentReport format
□ Set up hourly reporting
□ Document all changes
□ Update knowledge base
□ Respond to messages within SLA
□ Log all decisions
□ Participate in daily syncs

## For Security Audit
□ Monitor all changes
□ Immediate escalation for vulnerabilities
□ Review before critical operations
□ Veto power implementation

## For QA Engineer
□ Monitor code changes
□ Update test suites
□ Report test failures immediately
□ Gate releases

## For Supabase Architect
□ Notify on schema changes
□ Document all migrations
□ Coordinate with dependent agents
□ Maintain type definitions
```

## 🔐 Security Communication

### Security-Specific Protocol

```yaml
Security Escalation Path:
  Level 1: Potential Issue
    - Notify: Orchestrator
    - Action: Review within 2 hours
    
  Level 2: Confirmed Vulnerability
    - Notify: All agents
    - Action: Stop related work
    
  Level 3: Critical Security Breach
    - Notify: All agents + User
    - Action: Emergency halt
    
Security Review Gates:
  - Before API deployment
  - Before database migrations
  - Before authentication changes
  - Before payment integration
  - Before production deployment
```

---

This communication protocol ensures all agents work cohesively, share knowledge effectively, and prevent conflicts while building the Nail App. The orchestrator serves as the central hub, but agents can communicate directly when needed, always keeping the orchestrator informed of significant changes or decisions.