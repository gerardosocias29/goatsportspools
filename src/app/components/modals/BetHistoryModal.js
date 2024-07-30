import { Dialog } from "primereact/dialog";
import Table from "../tables/Table";

const BetHistoryModal = ({
  visible = false, 
  header = "Parlay Bets",
  onHide,
  data,
  columns
}) => {


  return (
    <>
      <Dialog className="lg:w-2/3 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={onHide}>
        <Table
          data={data}
          columns={columns}
          paginator={false}
          scrollable={true} scrollHeight="450px"
        />
      </Dialog>
    </>
  );
}

export default BetHistoryModal;