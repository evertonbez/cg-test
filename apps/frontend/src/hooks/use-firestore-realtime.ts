import { db } from "@cograde/firebase/client";
import {
  collection,
  type DocumentData,
  onSnapshot,
  query,
  type QueryConstraint,
  type QuerySnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useFirestoreRealtime<T = DocumentData>(
  path: string,
  constraints: QueryConstraint[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, path), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err: any) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [path, JSON.stringify(constraints)]);

  return { data, loading, error };
}
