package boltdb

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"mercury-dasha/internal/models"
	bolt "go.etcd.io/bbolt"
)

var (
	BucketFoundational = []byte("foundational")
	BucketContextNodes = []byte("context_nodes")
	BucketDashaCycles  = []byte("dasha_cycles")
	BucketAlchemical   = []byte("alchemical")
	BucketAuthorOpus   = []byte("author_opus")
)

type Store struct {
	db *bolt.DB
}

func NewStore(dbPath string) (*Store, error) {
	dir := filepath.Dir(dbPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create boltdb directory %s: %w", dir, err)
		}
	}

	db, err := bolt.Open(dbPath, 0600, &bolt.Options{Timeout: 2 * time.Second})
	if err != nil {
		return nil, fmt.Errorf("failed to open boltdb at %s: %w", dbPath, err)
	}

	store := &Store{db: db}
	if err := store.Init(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to init buckets: %w", err)
	}

	return store, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) DB() *bolt.DB {
	return s.db
}

func (s *Store) Init() error {
	return s.db.Update(func(tx *bolt.Tx) error {
		buckets := [][]byte{
			BucketFoundational,
			BucketContextNodes,
			BucketDashaCycles,
			BucketAlchemical,
			BucketAuthorOpus,
		}
		for _, b := range buckets {
			if _, err := tx.CreateBucketIfNotExists(b); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *Store) SaveFoundationalStatement(stmt *models.FoundationalStatement) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketFoundational)
		data, err := json.Marshal(stmt)
		if err != nil {
			return err
		}
		return b.Put([]byte("root"), data)
	})
}

func (s *Store) GetFoundationalStatement() (*models.FoundationalStatement, error) {
	var stmt models.FoundationalStatement
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketFoundational)
		data := b.Get([]byte("root"))
		if data == nil {
			return fmt.Errorf("foundational statement not found in boltdb")
		}
		return json.Unmarshal(data, &stmt)
	})
	if err != nil {
		return nil, err
	}
	return &stmt, nil
}

func (s *Store) SaveContextNode(node *models.ContextNode) error {
	node.UpdatedAt = time.Now()
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketContextNodes)
		data, err := json.Marshal(node)
		if err != nil {
			return err
		}
		return b.Put([]byte(node.Key), data)
	})
}

func (s *Store) GetContextNode(key string) (*models.ContextNode, error) {
	var node models.ContextNode
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketContextNodes)
		data := b.Get([]byte(key))
		if data == nil {
			return fmt.Errorf("context node %q not found", key)
		}
		return json.Unmarshal(data, &node)
	})
	if err != nil {
		return nil, err
	}
	return &node, nil
}

func (s *Store) GetContextNodeWithRelatives(key string) (*models.ContextNode, error) {
	node, err := s.GetContextNode(key)
	if err != nil {
		return nil, err
	}

	var relatives []models.ContextRelation
	err = s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketContextNodes)
		for _, relKey := range node.RelativeKeys {
			data := b.Get([]byte(relKey))
			if data != nil {
				var relNode models.ContextNode
				if err := json.Unmarshal(data, &relNode); err == nil {
					relatives = append(relatives, models.ContextRelation{
						Key:          relNode.Key,
						Title:        relNode.Title,
						Category:     relNode.Category,
						RelationType: "harmonic_correspondence",
					})
				}
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	node.RelativeContext = relatives
	return node, nil
}

func (s *Store) ListContextNodes(category string) ([]models.ContextNode, error) {
	var nodes []models.ContextNode
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketContextNodes)
		return b.ForEach(func(k, v []byte) error {
			var node models.ContextNode
			if err := json.Unmarshal(v, &node); err != nil {
				return err
			}
			if category == "" || node.Category == category {
				nodes = append(nodes, node)
			}
			return nil
		})
	})
	return nodes, err
}

func (s *Store) SaveDashaOverview(dasha *models.DashaOverview) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketDashaCycles)
		data, err := json.Marshal(dasha)
		if err != nil {
			return err
		}
		return b.Put([]byte("mercury_17yr"), data)
	})
}

func (s *Store) GetDashaOverview() (*models.DashaOverview, error) {
	var dasha models.DashaOverview
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketDashaCycles)
		data := b.Get([]byte("mercury_17yr"))
		if data == nil {
			return fmt.Errorf("dasha overview not found")
		}
		return json.Unmarshal(data, &dasha)
	})
	if err != nil {
		return nil, err
	}
	return &dasha, nil
}

func (s *Store) SaveNakshatras(nakshatras []models.Nakshatra) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketDashaCycles)
		data, err := json.Marshal(nakshatras)
		if err != nil {
			return err
		}
		return b.Put([]byte("mercurial_nakshatras"), data)
	})
}

func (s *Store) GetNakshatras() ([]models.Nakshatra, error) {
	var nakshatras []models.Nakshatra
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketDashaCycles)
		data := b.Get([]byte("mercurial_nakshatras"))
		if data == nil {
			return fmt.Errorf("nakshatras not found")
		}
		return json.Unmarshal(data, &nakshatras)
	})
	return nakshatras, err
}

func (s *Store) SaveAlchemicalPrinciples(principles []models.AlchemicalPrinciple) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketAlchemical)
		data, err := json.Marshal(principles)
		if err != nil {
			return err
		}
		return b.Put([]byte("tria_prima"), data)
	})
}

func (s *Store) GetAlchemicalPrinciples() ([]models.AlchemicalPrinciple, error) {
	var principles []models.AlchemicalPrinciple
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketAlchemical)
		data := b.Get([]byte("tria_prima"))
		if data == nil {
			return fmt.Errorf("alchemical principles not found")
		}
		return json.Unmarshal(data, &principles)
	})
	return principles, err
}

func (s *Store) SaveAuthorOpus(opus *models.AuthorOpus) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketAuthorOpus)
		data, err := json.Marshal(opus)
		if err != nil {
			return err
		}
		return b.Put([]byte("justin_andrew_wood"), data)
	})
}

func (s *Store) GetAuthorOpus() (*models.AuthorOpus, error) {
	var opus models.AuthorOpus
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketAuthorOpus)
		data := b.Get([]byte("justin_andrew_wood"))
		if data == nil {
			return fmt.Errorf("author opus not found")
		}
		return json.Unmarshal(data, &opus)
	})
	if err != nil {
		return nil, err
	}
	return &opus, nil
}
