package wishes

import "sync"

type changeBroker struct {
	mu          sync.Mutex
	subscribers map[chan struct{}]struct{}
}

func newChangeBroker() *changeBroker {
	return &changeBroker{subscribers: make(map[chan struct{}]struct{})}
}

func (b *changeBroker) subscribe() (<-chan struct{}, func()) {
	updates := make(chan struct{}, 1)
	b.mu.Lock()
	b.subscribers[updates] = struct{}{}
	b.mu.Unlock()
	return updates, func() {
		b.mu.Lock()
		delete(b.subscribers, updates)
		b.mu.Unlock()
	}
}

func (b *changeBroker) publish() {
	b.mu.Lock()
	defer b.mu.Unlock()
	for subscriber := range b.subscribers {
		select {
		case subscriber <- struct{}{}:
		default:
		}
	}
}
