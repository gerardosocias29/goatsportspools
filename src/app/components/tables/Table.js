import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Sidebar } from "primereact/sidebar";
import { FilterMatchMode } from "primereact/api";

const Table = ({ 
  checkbox = false, columns, data,
    actions = false, action_types = {
      view: true,
      edit: false,
      delete: false,
    }, customActions = null, customActionsWidth = '3rem', 
    expandableRow = false, onRowExpand, onRowCollapse, rowExpansionTemplate,
    paginator = true,
    actionsClicked,
    hasOptions = false,
    scrollable = false,
    scrollHeight = "400px"
  }) => {
 
  const [selectedData, setSelectedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);

  const renderActions = (data) => {
    // console.log(data)
    return (
      <div className="flex justify-center">
        { action_types.view && <Button className="text-purple ring-0" icon="pi pi-eye" rounded text aria-label="View" onClick={(e) => actionsClicked && actionsClicked(data.id, 'view', data) }/> }
        { action_types.edit && <Button className="text-blue-500 ring-0" icon="pi pi-pencil" rounded text aria-label="Edit" onClick={(e) => actionsClicked && actionsClicked(data.id, 'edit', data) }/> }
        { action_types.delete && <Button className="text-red-500 ring-0" icon="pi pi-trash" rounded text aria-label="Trash" onClick={(e) => actionsClicked && actionsClicked(data.id, 'trash', data) }/> }
      </div>
    );
  }

  const renderTemplate = (value, template, rowData, field) => { return ( template(value, rowData, field) ) }

  const itemsPerPage = [
    { value: '10', name: '10'},
    { value: '50', name: '50'},
    { value: '100', name: '100'},
  ]
  const [pageItem, setPageItem] = useState(itemsPerPage[0]);
  const [filterVisible, setFilterVisible] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };


  useEffect(() => {
    // fetch api then set the data
  }, []);

  return (
  <>
    {
      hasOptions &&
      <div className="mb-4 flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="rounded-lg border border-gray w-full md:w-1/3 flex items-center">
          <i className="pi pi-search p-2 text-label"></i>
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search items..." className="border-none bg-transparent ring-0 w-full" />
        </div>
        <div className="flex w-full md:auto justify-end gap-2 flex-wrap">
          <div className="flex justify-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-label">Items per page</label>
              <div className="rounded-lg border border-gray">
                <Dropdown value={pageItem.value} onChange={(e) => {setPageItem(e)}} options={itemsPerPage} optionLabel="name" className="border-none ring-0 w-full bg-transparent" />
              </div>
            </div>
          </div>
          <div>
            <Button className="bg-transparent text-black rounded-lg border-gray w-full md:auto" iconPos="right" label="Filter" icon="pi pi-filter" onClick={() => setFilterVisible(true)} />
            <Sidebar visible={filterVisible} position="right" onHide={() => setFilterVisible(false)}>
              <h2>Filter Here</h2>
            </Sidebar>
          </div>
        </div>
      </div>
    }
    <DataTable value={data} paginator={paginator} rows={(paginator ? pageItem.value : undefined)} filters={filters}
      emptyMessage={(<>
        <div className="flex flex-col items-center gap-4 text-center justify-center">
          <p className="text-3xl">No Data Found</p>
        </div>
      </>)}
      selectionMode={!checkbox ? null : 'checkbox'} rowHover={true} selection={selectedData} onSelectionChange={(e) => setSelectedData(e.value)} dataKey="id"
      onRowToggle={(e) => setExpandedRows(e.data)} expandedRows={expandedRows} onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} rowExpansionTemplate={rowExpansionTemplate}
      scrollable={scrollable} scrollHeight={scrollHeight}
    >
      {checkbox && <Column headerClassName="bg-background text-white rounded-tl-xl rounded-bl-xl border-none" selectionMode="multiple" headerStyle={{ width: '3rem' }} />}
        {
          columns.map((col, i) => {
            return <Column 
              key={i} 
              headerClassName={`${col.headerClassName? col.headerClassName:''} text-center bg-background text-white ${(i==0 && !checkbox ? 'rounded-tl-xl rounded-bl-xl' : '' )} ${(i === (columns.length-1) && !actions)? 'rounded-tr-xl rounded-br-xl' : ''} ${ expandableRow && col.has_expander ? '' : 'border-white border'} font-normal text-white`}
              field={col.field} 
              header={col.header}
              style={col.headerStyle}
              body={(data) => col.hasTemplate ? renderTemplate(data[col.field], col.template, data, col.field) : data[col.field]}
            />;
          })
        }
        {actions && !customActions && <Column headerClassName="bg-background text-white rounded-tr-xl rounded-br-xl font-normal text-white border-t" header={'Actions'} headerStyle={{ minWidth: '3rem' }} body={renderActions}/>}
        {actions && customActions && <Column headerClassName="bg-background text-white rounded-tr-xl rounded-br-xl font-normal text-white border-t" header={'Actions'} headerStyle={{ minWidth: customActionsWidth }} body={customActions}/>}
    </DataTable>
  </>
  );
}

export default Table;