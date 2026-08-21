package axismundi

import (
	"encoding/json"
	"fmt"
	"sort"
	"time"

	bolt "go.etcd.io/bbolt"
)

const DirectivesBucket = "axis_mundi_directives"

type Store struct {
	db *bolt.DB
}

func NewStore(db *bolt.DB) (*Store, error) {
	err := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(DirectivesBucket))
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("failed to init axis mundi bucket: %w", err)
	}
	return &Store{db: db}, nil
}

func (s *Store) SaveDirective(d AxisDirective) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(DirectivesBucket))
		if b == nil {
			return fmt.Errorf("bucket %s not found", DirectivesBucket)
		}

		data, err := json.Marshal(d)
		if err != nil {
			return err
		}
		return b.Put([]byte(d.ID), data)
	})
}

func (s *Store) GetDirective(id string) (*AxisDirective, error) {
	var d AxisDirective
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(DirectivesBucket))
		if b == nil {
			return fmt.Errorf("bucket %s not found", DirectivesBucket)
		}
		data := b.Get([]byte(id))
		if data == nil {
			return fmt.Errorf("directive %s not found", id)
		}
		return json.Unmarshal(data, &d)
	})
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (s *Store) ListDirectives() ([]AxisDirective, error) {
	var list []AxisDirective
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(DirectivesBucket))
		if b == nil {
			return nil
		}
		return b.ForEach(func(k, v []byte) error {
			var d AxisDirective
			if err := json.Unmarshal(v, &d); err == nil {
				list = append(list, d)
			}
			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].CreatedAt.After(list[j].CreatedAt)
	})

	return list, nil
}

func (s *Store) GetPendingExecuteDirectives() ([]AxisDirective, error) {
	all, err := s.ListDirectives()
	if err != nil {
		return nil, err
	}

	var pending []AxisDirective
	for _, d := range all {
		if d.IsExecute && (d.Status == StatusQueuedForAgent || d.Status == StatusExecuting) {
			pending = append(pending, d)
		}
	}
	return pending, nil
}

func (s *Store) UpdateStatus(id string, status DirectiveStatus, executionLog string) (*AxisDirective, error) {
	var updated AxisDirective
	err := s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(DirectivesBucket))
		if b == nil {
			return fmt.Errorf("bucket %s not found", DirectivesBucket)
		}

		data := b.Get([]byte(id))
		if data == nil {
			return fmt.Errorf("directive %s not found", id)
		}

		if err := json.Unmarshal(data, &updated); err != nil {
			return err
		}

		updated.Status = status
		updated.UpdatedAt = time.Now().UTC()
		if executionLog != "" {
			if updated.ExecutionLog != "" {
				updated.ExecutionLog += "\n" + executionLog
			} else {
				updated.ExecutionLog = executionLog
			}
		}

		encoded, err := json.Marshal(updated)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), encoded)
	})

	if err != nil {
		return nil, err
	}
	return &updated, nil
}