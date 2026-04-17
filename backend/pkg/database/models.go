package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string
type Status string
type Priority string
type TaskStatus string

const (
	RoleAdmin  Role = "admin"
	RoleEditor Role = "editor"
	RoleViewer Role = "viewer"

	StatusDraft    Status = "draft"
	StatusReview   Status = "review"
	StatusApproved Status = "approved"
	StatusRejected Status = "rejected"

	PriorityCritical Priority = "critical"
	PriorityHigh     Priority = "high"
	PriorityMedium   Priority = "medium"
	PriorityLow      Priority = "low"

	TaskStatusTodo       TaskStatus = "todo"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusDone       TaskStatus = "done"
	TaskStatusBlocked    TaskStatus = "blocked"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string     `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"not null" json:"-"`
	FullName     string     `json:"full_name"`
	Role         Role       `gorm:"type:varchar(20);default:'viewer'" json:"role"`
	AvatarURL    string     `json:"avatar_url"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Requirement struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	Status      Status     `gorm:"type:varchar(20);default:'draft'" json:"status"`
	Priority    Priority   `gorm:"type:varchar(20);default:'medium'" json:"priority"`
	CreatedByID uuid.UUID  `gorm:"type:uuid" json:"created_by_id"`
	CreatedBy   *User      `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
	AssignedToID *uuid.UUID `gorm:"type:uuid" json:"assigned_to_id"`
	AssignedTo  *User      `gorm:"foreignKey:AssignedToID" json:"assigned_to,omitempty"`
	DueDate     *time.Time `json:"due_date"`
	Position    int        `gorm:"default:0" json:"position"`
	Tags        []Tag      `gorm:"many2many:requirement_tags;" json:"tags,omitempty"`
	Comments    []Comment  `gorm:"foreignKey:RequirementID" json:"comments,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
}

func (r *Requirement) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

type Tag struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name  string    `gorm:"uniqueIndex;not null" json:"name"`
	Color string    `json:"color"`
}

func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

type Comment struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	RequirementID uuid.UUID `gorm:"type:uuid;not null" json:"requirement_id"`
	AuthorID      uuid.UUID `gorm:"type:uuid;not null" json:"author_id"`
	Author        *User     `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Body          string    `gorm:"type:text;not null" json:"body"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

type ActivityLog struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	RequirementID uuid.UUID `gorm:"type:uuid;not null" json:"requirement_id"`
	ActorID       uuid.UUID `gorm:"type:uuid;not null" json:"actor_id"`
	Actor         *User     `gorm:"foreignKey:ActorID" json:"actor,omitempty"`
	Action        string    `json:"action"`
	Meta          string    `gorm:"type:jsonb" json:"meta"`
	CreatedAt     time.Time `json:"created_at"`
}

func (a *ActivityLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

type Notification struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Message   string    `gorm:"type:text" json:"message"`
	Link      string    `json:"link"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}

type App struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Users       []User    `gorm:"many2many:app_users;" json:"users,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (a *App) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

type Task struct {
	ID            uuid.UUID    `gorm:"type:uuid;primaryKey" json:"id"`
	RequirementID uuid.UUID    `gorm:"type:uuid;not null" json:"requirement_id"`
	Requirement   *Requirement `gorm:"foreignKey:RequirementID" json:"requirement,omitempty"`
	Title         string       `gorm:"not null" json:"title"`
	Description   string       `gorm:"type:text" json:"description"`
	Status        TaskStatus   `gorm:"type:varchar(20);default:'todo'" json:"status"`
	TargetDate    *time.Time   `json:"target_date"`
	AppID         *uuid.UUID   `gorm:"type:uuid" json:"app_id"`
	App           *App         `gorm:"foreignKey:AppID" json:"app,omitempty"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
