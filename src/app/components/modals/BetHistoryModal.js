import { Dialog } from "primereact/dialog";
import Table from "../tables/Table";

const BetHistoryModal = ({
  visible = false, 
  header = "Bets",
  onHide,
  data,
  columns,
  scrollable = true,
  scrollHeight = "450px",
  classname = "",
  handleOnSelect = () => {}
}) => {

  const onSelect = (e) => {
    console.log('HANDLEONSELECT!!!!!!', e)
    handleOnSelect(e);
  }

  return (
    <>
      <Dialog className={`lg:w-2/3 w-[95%] ${classname}`} header={header} visible={visible} draggable={false} maximizable={false} onHide={onHide}>
        <Table
          data={data}
          columns={columns}
          paginator={false}
          scrollable={scrollable} scrollHeight={scrollHeight}
          selectionMode="single" handleOnSelect={onSelect}
        />
      </Dialog>
    </>
  );
}

export default BetHistoryModal;