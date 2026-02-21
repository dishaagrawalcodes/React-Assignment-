import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useRef } from "react";
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);
  const [rows] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
 const [selectedIds, setSelectedIds] = useState<number[]>([]);
 const overlayRef = useRef<OverlayPanel>(null);
const [selectCount, setSelectCount] = useState<number | null>(null);
  const fetchArtworks = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data = await response.json();

      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onPage = (event: any) => {
    const pageNumber = event.page + 1;
    setFirst(event.first);
    fetchArtworks(pageNumber);
  };

  return (
    <div className="p-4">
      <h2>Artworks Table</h2>
      <div className="mb-3">
  <Button
    label="Select Rows"
    icon="pi pi-check-square"
    onClick={(e) => overlayRef.current?.toggle(e)}
  />
  <OverlayPanel ref={overlayRef}>
  <div className="flex flex-column gap-3">
    <label>Select number of rows:</label>

    <InputNumber
      value={selectCount}
      onValueChange={(e) => setSelectCount(e.value ?? null)}
      min={1}
    />

    <Button
  label="Apply"
  disabled={!selectCount || selectCount <= 0}
  onClick={() => {
    if (!selectCount || selectCount <= 0) {
      alert("Enter a valid number");
      return;
    }

    if (selectCount > artworks.length) {
      alert("Cannot select more than rows available in current page.");
      return;
    }

    const idsToSelect = artworks
      .slice(0, selectCount)
      .map((item) => item.id);

    const updatedIds = Array.from(
      new Set([...selectedIds, ...idsToSelect])
    );

    setSelectedIds(updatedIds);
    overlayRef.current?.hide();
    setSelectCount(null);
  }}
/>
  </div>
</OverlayPanel>
</div>
      <DataTable
  value={artworks}
  dataKey="id"
  lazy
  paginator
  first={first}
  rows={rows}
  totalRecords={totalRecords}
  loading={loading}
  onPage={onPage}
  selectionMode="checkbox"
  selection={artworks.filter((item) =>
    selectedIds.includes(item.id)
  )}
  onSelectionChange={(e) => {
    const currentPageIds = artworks.map((item) => item.id);

    const selectedOnPage = (e.value as Artwork[]).map(
      (item) => item.id
    );

    const updatedIds = [
      ...selectedIds.filter((id) => !currentPageIds.includes(id)),
      ...selectedOnPage,
    ];

    setSelectedIds(updatedIds);
  }}
>
  <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
  <Column field="title" header="Title" />
  <Column field="place_of_origin" header="Origin" />
  <Column field="artist_display" header="Artist" />
  <Column field="inscriptions" header="Inscriptions" />
  <Column field="date_start" header="Start Year" />
  <Column field="date_end" header="End Year" />
</DataTable>
    </div>
  );
}

export default App;