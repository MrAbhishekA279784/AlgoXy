import { useEffect, useRef, useCallback } from 'react';
import { 
  onSnapshot, 
  Unsubscribe,
  Query,
  collection,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export function useFirestoreCollection(
  collectionName: string,
  options?: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
    whereField?: string;
    whereValue?: any;
  }
) {
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const dataRef = useRef<any[]>([]);
  const loadingRef = useRef(true);
  const errorRef = useRef<Error | null>(null);

  const setupListener = useCallback(() => {
    cleanup();
    loadingRef.current = true;
    errorRef.current = null;

    try {
      let q: Query = collection(db, collectionName);

      if (options?.whereField && options?.whereValue) {
        q = query(q, orderBy(options.whereField, options.orderDirection || 'desc'));
        if (options.limitCount) {
          q = query(q, limit(options.limitCount));
        }
      } else if (options?.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
        if (options.limitCount) {
          q = query(q, limit(options.limitCount));
        }
      }

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          dataRef.current = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          loadingRef.current = false;
        },
        (error) => {
          console.error(`Firestore listener error for ${collectionName}:`, error);
          errorRef.current = error;
          loadingRef.current = false;
        }
      );
    } catch (error) {
      console.error(`Failed to setup listener for ${collectionName}:`, error);
      errorRef.current = error as Error;
      loadingRef.current = false;
    }
  }, [collectionName, options?.orderByField, options?.orderDirection, options?.limitCount, options?.whereField, options?.whereValue]);

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    setupListener();
    return cleanup;
  }, [setupListener, cleanup]);

  return {
    data: dataRef.current,
    loading: loadingRef.current,
    error: errorRef.current,
    refresh: setupListener,
    cleanup
  };
}

export function useRealTimeListener<T>(
  collectionName: string,
  documentId: string
) {
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const dataRef = useRef<T | null>(null);
  const loadingRef = useRef(true);
  const errorRef = useRef<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, collectionName, documentId);
    
    unsubscribeRef.current = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          dataRef.current = { id: docSnap.id, ...docSnap.data() } as T;
        } else {
          dataRef.current = null;
        }
        loadingRef.current = false;
      },
      (error) => {
        console.error(`Firestore document listener error:`, error);
        errorRef.current = error;
        loadingRef.current = false;
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, documentId]);

  return { data: dataRef.current, loading: loadingRef.current, error: errorRef.current };
}

export function createStableListener(
  collectionName: string,
  callback: (data: any[]) => void,
  deps: any[] = []
) {
  let unsubscribe: Unsubscribe | null = null;

  const start = () => {
    cleanup();
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Listener error:', error);
      callback([]);
    });
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  useEffect(() => {
    start();
    return cleanup;
  }, deps);

  return { start, cleanup };
}

import { doc } from 'firebase/firestore';