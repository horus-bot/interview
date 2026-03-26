import * as React from "react";



const Table = React.forwardRef(


  ({ className, ...props }, ref) =>
  <div style={{ position: "relative", width: "100%", overflow: "auto" }}>
    <table
      ref={ref}

      {...props} />
    
  </div>
);
Table.displayName = "Table";

const TableHeader = React.forwardRef(


  ({ className, ...props }, ref) =>
  <thead ref={ref} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(


  ({ className, ...props }, ref) =>
  <tbody
    ref={ref}

    {...props} />

);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(


  ({ className, ...props }, ref) =>
  <tfoot
    ref={ref}




    {...props} />

);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(


  ({ className, ...props }, ref) =>
  <tr
    ref={ref}




    {...props} />

);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(


  ({ className, ...props }, ref) =>
  <th
    ref={ref}




    {...props} />

);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(


  ({ className, ...props }, ref) =>
  <td
    ref={ref}

    {...props} />

);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(


  ({ className, ...props }, ref) =>
  <caption
    ref={ref}

    {...props} />

);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption };