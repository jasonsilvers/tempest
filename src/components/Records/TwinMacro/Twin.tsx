import tw from 'twin.macro';
import { ECategorie } from '../../../const/enums';

export const TableData = tw.div`text-secondarytext mx-3`;
export const TableRow = tw.div`text-black border-b text-sm flex max-width[1440px] min-width[1040px] height[45px] py-3 items-center`;
export const TableHeaderRow = tw.div`text-black border-b text-sm flex max-width[1440px] min-width[1040px] height[40px]`;

// Tokens
export const Token = tw.div`rounded-xl h-5 w-5 mr-3`;
export const Overdue = tw(Token)`background-color[#AB0D0D]`;
export const Done = tw(Token)`background-color[#49C68A]`;
export const All = Token;
export const Awaiting_Signature = tw(Token)`background-color[#e98c00]`;
export const Upcoming = tw(Token)`background-color[#FAC50A]`;
export const To_Do = tw(Token)`background-color[#e98c00]`;
export const Archived = tw(Token)`bg-gray-400`;
// For Dynamic Tokens in the Record Row
export const TokenObj: { [K in ECategorie]: typeof Token } = {
  Overdue,
  Done,
  All,
  Awaiting_Signature,
  Upcoming,
  Archived,
  To_Do,
};

// Buttons
export const ActionButton = tw.button`bg-secondary border-radius[5px] min-width[120px] text-white min-height[25px] flex justify-center items-center`;
export const NoActionButton = tw(
  ActionButton
)`bg-transparent text-primary border-primary border cursor-not-allowed outline-none focus:outline-none`;
export const DisabledButton = tw(NoActionButton)`border-black border-opacity-20 text-black text-opacity-20`;
